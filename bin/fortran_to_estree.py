#!/usr/bin/env python

import re
import sys
import json
from fparser.common.readfortran import FortranStringReader
from fparser.two.parser import ParserFactory
from fparser.two.utils import walk, get_child
from fparser.two import Fortran2003
import argparse

from fparser.two.Fortran2003 import (
    Add_Operand,
    And_Operand,
    Assignment_Stmt,
    Assumed_Size_Spec,
    Actual_Arg_Spec_List,
    Block_Nonlabel_Do_Construct,
    Block_Label_Do_Construct,
    Char_Literal_Constant,
    Call_Stmt,
    Comment,
    Complex_Literal_Constant,
    Component_Spec_List,
    Continue_Stmt,
    Data_Stmt,
    Data_Stmt_Object_List,
    Data_Stmt_Set,
    Data_Stmt_Value_List,
    Dummy_Arg_List,
    Else_Stmt,
    Else_If_Stmt,
    End_Do_Stmt,
    End_If_Stmt,
    End_Function_Stmt,
    End_Subroutine_Stmt,
    Entity_Decl,
    Entity_Decl_List,
    Equiv_Operand,
    Explicit_Shape_Spec,
    Explicit_Shape_Spec_List,
    Execution_Part,
    External_Stmt,
    External_Name_List,
    Function_Stmt,
    Function_Subprogram,
    If_Stmt,
    If_Then_Stmt,
    If_Construct,
    Implicit_Part,
    Int_Literal_Constant,
    Intrinsic_Function_Reference,
    Intrinsic_Procedure_Name_List,
    Intrinsic_Stmt,
    Intrinsic_Name,
    Intrinsic_Type_Spec,
    Label,
    Label_Do_Stmt,
    Level_1_Expr,
    Level_2_Expr,
    Level_2_Unary_Expr,
    Level_3_Expr,
    Level_4_Expr,
    Logical_Literal_Constant,
    Loop_Control,
    Mult_Operand,
    Name,
    Named_Constant_Def_List,
    Named_Constant_Def,
    Nonlabel_Do_Stmt,
    Or_Operand,
    Parameter_Stmt,
    Parenthesis,
    Part_Ref,
    Program,
    Real_Literal_Constant,
    Return_Stmt,
    Section_Subscript_List,
    Specification_Part,
    Structure_Constructor,
    Subroutine_Stmt,
    Subroutine_Subprogram,
    Type_Declaration_Stmt,
    Type_Name,
)

LEVEL_4_OPERATORS = {
    '.OR.': '||',
    '.AND.': '&&',
    '.NOT.': '!',
    '.EQ.': '===',
    '.NE.': '!==',
    '.GT.': '>',
    '.GE.': '>=',
    '.LT.': '<',
    '.LE.': '<=',
    '<': '<',
    '>': '>',
    '<=': '<=',
    '>=': '>=',
    '/=': '!=',
    '==': '==',
}

LEVEL_2_OPERATORS = {
    '+': '+',
    '-': '-',
    '*': '*',
    '/': '/',
    '**': '**',
    'MOD': '%'
}

UNARY_OPERATORS = {
    '+': '+',
    '-': '-',
}

LOGICAL_LITERALS = {
    '.TRUE.': True,
    '.FALSE.': False
}

ASSIGNMENT_OPERATORS = {
    '=': '='
}

INTRINSIC_FUNCTIONS = {
    'sqrt': 'sqrt',
    'abs': 'abs',
    'dabs': 'abs',
    'min': 'min',
    'max': 'max',
    'sign': 'sign',
    'dconjg': 'dconjg',
    'conjg': 'conjg',
    'dimag': 'dimag',
    'aimag': 'aimag',
}

TYPES = {
    'logical': 'bool',
    'real': 'float64',
    'real(wp)': 'float64',
    'double precision': 'float64',
    'integer': 'int32',
    'complex*16': 'complex128',
    'complex(wp)': 'complex128',
    'complex': 'complex128',
    'character': 'String',
}

def index_of (parent, node):
    for idx, child in enumerate(parent.children):
        if child is node:
            return idx
    return -1

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

def parse_fortran_float(string):
    return float(string.replace('d', 'e').replace('D', 'E'))

def parse_dummy_arg_list(node):
    assert isinstance(node, Dummy_Arg_List)
    return [arg.string.lower() for arg in node.items]

def filt(lst):
    return [item for item in lst if item is not None]

def flatten(S):
    if S == []:
        return S
    if isinstance(S[0], list):
        return flatten(S[0]) + flatten(S[1:])
    return S[:1] + flatten(S[1:])

def get_value(node):
    if isinstance(node, Int_Literal_Constant):
        return {
            'type': 'int32',
            'value': int(node.string)
        }
    elif isinstance(node, Real_Literal_Constant):
        return {
            'type': 'float64',
            'value': parse_fortran_float(node.string)
        }
    else:
        raise TypeError('Unrecognized node type: %s' % node.__class__.__name__)

def assert_child_types(node, type_list, allow_none=True):
    for child in node.children:
        if allow_none and child is None:
            continue
        if not any(isinstance(child, t) for t in type_list):
            raise TypeError('Unexpected child type: %s' % child.__class__.__name__)

def find_one(node, node_type):
    all = [node for node in walk(node) if isinstance(node, node_type)]
    assert len(all) == 1, 'Expected one node of type %s, found %d' % (node_type.__name__, len(all))
    return all[0]

# Use of this function is discouraged, as it silences unhanded types. Instead, iterate
# over all children and raise an error if a node type is unhandled.
def find_all(node, node_type):
    return [node for node in walk(node) if isinstance(node, node_type)]

def get_one_child(node, node_type):
    all = [child for child in node.children if isinstance(child, node_type)]
    assert len(all) == 1, 'Expected one child of type %s, found %d' % (node_type.__name__, len(all))
    return all[0]

def parse_data_stmt(node):
    assert_child_types(node, (Data_Stmt_Set,))
    constants = {}
    for dataset in node.children:
        assert_child_types(dataset, (Data_Stmt_Object_List, Data_Stmt_Value_List))
        obj_list = find_one(node, Data_Stmt_Object_List)
        val_list = find_one(node, Data_Stmt_Value_List)

        assert len(obj_list.items) == len(val_list.items)
        for i in range(len(obj_list.items)):
            name = obj_list.items[i].string.lower()
            constants[name] = get_value(val_list.items[i])

    return constants


def parse_type_declaration_stmt (node):
    from fparser.two.Fortran2003 import Attr_Spec_List
    assert_child_types(node, (Intrinsic_Type_Spec, Entity_Decl_List, Attr_Spec_List))

    declarations = {}

    # children[1] is Attr_Spec_List (e.g., PARAMETER) or None
    # We handle PARAMETER attributes below; other attributes are ignored for now

    int_type_spec = find_one(node, Intrinsic_Type_Spec)
    entity_decl_list = find_one(node, Entity_Decl_List)

    # Implement as needed if not None
    #assert int_type_spec.items[1] == None

    type = TYPES[int_type_spec.string.lower()]

    for index, decl in enumerate(entity_decl_list.children):
        if isinstance(decl, Entity_Decl):
            # Recall, Fortran is case-insensitive
            name = decl.get_name().string.lower()

            aspec = get_child(decl, Assumed_Size_Spec)
            shape = None

            if aspec is None:
                espec = get_child(decl, Explicit_Shape_Spec_List)
                if espec is not None:
                    if shape is None:
                        shape = []
                    for child0 in espec.children:
                        if isinstance(child0, Explicit_Shape_Spec):
                            size = get_one_child(child0, Int_Literal_Constant)
                            shape.append(get_value(size)['value'])
                        else:
                            raise TypeError('Unexpected child type in Explicit_Shape_Spec_List: %s' % child0.__class__.__name__)
            elif isinstance(aspec, Assumed_Size_Spec):
                for child0 in aspec.children:
                    if shape is None:
                        shape = []
                    if child0 is None:
                        pass
                    elif isinstance(child0, Explicit_Shape_Spec_List):
                        for child1 in child0.children:
                            if isinstance(child1, Explicit_Shape_Spec):
                                _name = get_one_child(child1, Name)
                                shape.append(_name.string.lower())
                            else:
                                raise TypeError('Unexpected child type in Explicit_Shape_Spec_List: %s' % child1.__class__.__name__)
                    else:
                        raise TypeError('Unexpected child type in Assumed_Size_Spec: %s' % child0.__class__.__name__)
                if shape is not None:
                    shape.append('*')
            else:
                raise TypeError('Unexpected child type in Entity_Decl: %s' % aspec.__class__.__name__)
            
            output_name = name

            strided = False
            strided_args = []
            remove_args = []
            if shape and len(shape) > 0 and shape[-1] == '*':
                dim = len(shape)
                strided = True
                output_name = output_name.upper() if dim > 1 else output_name

                remove_args = [arg for arg in shape if arg != '*']
                strided_args = ['stride%s%s' % (output_name.upper(), i+1 if dim > 1 else '') for i in range(dim)]
                strided_args.append('offset%s' % output_name.upper())
            
            declarations[name] = {
                'name': output_name,
                'type': type,
                'shape': shape,
                'strided': strided,
                'strided_args': strided_args,
                'remove_args': remove_args,
            }

            eprint(declarations[name])
        else:
            raise TypeError('Unexpected child type in Type_Declaration_Stmt: %s' % entity_decl.__class__.__name__)
    
    return declarations

def merge_dicts (dst, src):
    for key, value in src.items():
        if key in dst:
            raise KeyError(f"Duplicate key '{key}' found while merging dictionaries")
        dst[key] = value
    return dst

def parse_intrinsic_stmt (node):
    intrinsics = {}
    for child in node.children:
        if child == 'INTRINSIC':
            continue
        elif isinstance(child, Intrinsic_Procedure_Name_List):
            for name in child.children:
                _name = name.string.lower()
                intrinsics[_name] = {
                    'name': _name
                }
        else:
            raise TypeError('Unexpected child type in Intrinsic_Stmt: %s' % child.__class__.__name__)
    return intrinsics

def parse_implicit_part (node, comments):
    implicit = {}
    for child0 in node.children:
        if isinstance(child0, Comment):
            comments.append(child0)
        elif isinstance(child0, Parameter_Stmt):
            for child1 in child0.children:
                if isinstance(child1, str) and child1.lower() == 'parameter':
                    pass
                elif isinstance(child1, Named_Constant_Def_List):
                    for child2 in child1.children:
                        if isinstance(child2, Named_Constant_Def):
                            name = get_one_child(child2, Name)
                            implicit[name.string.lower()] = get_value(child2.items[1])
                        else:
                            raise TypeError('Unexpected child type in Named_Constant_Def_List: %s' % child2.__class__.__name__)
                else:
                    raise TypeError('Unexpected child type in Parameter_Stmt: %s' % child1.__class__.__name__)
        else:
            raise TypeError('Unexpected child type in Implicit_Part: %s' % child0.__class__.__name__)
    return implicit

def parse_external_stmt(node):
    externals = {}
    for child in node.children:
        if child == 'EXTERNAL':
            continue
        elif isinstance(child, External_Name_List):
            for child1 in child.children:
                assert isinstance
                externals[child1.string.lower()] = {
                    'name': child1.string.lower()
                }
        else:
            raise TypeError('Unexpected child type in External_Stmt: %s' % child.__class__.__name__)
    return externals

def parse_spec (node, comments):
    declarations = {}
    constants = {}
    intrinsics = {}
    externals = {}
    assert isinstance(node, Specification_Part)
    for child in node.children:
        if isinstance(child, Type_Declaration_Stmt):
            merge_dicts(declarations, parse_type_declaration_stmt(child))
        elif isinstance(child, Intrinsic_Stmt):
            merge_dicts(intrinsics, parse_intrinsic_stmt(child))
        elif isinstance(child, Data_Stmt):
            merge_dicts(constants, parse_data_stmt(child))
        elif isinstance(child, Implicit_Part):
            merge_dicts(constants, parse_implicit_part(child, comments))
        elif isinstance(child, External_Stmt):
            merge_dicts(externals, parse_external_stmt(child))
        else:
            raise TypeError('Unexpected child type in Specification_Part: %s' % child.__class__.__name__)
    
    return (declarations, constants, intrinsics, externals)

class TypeSpec:
    def __init__(self, name, type=None, size=None):
        self.name = name
        self.size = size
        self.type = type
    
    def __repr__(self):
        return f'TypeSpec(name={self.name}, type={self.type}, size={self.size})'
    
class Scope:
    def __init__(self, ast, parent_context=None, output_comments=True):
        self.ast = ast
        self.output_comments = output_comments
        self.parent_context = parent_context

        self.declarations = {}
        self.return_name = None
        self.intrinsics = {}
        self.constants = {}
        self.externals = {}
        self.comments = []
        self.variable_name_mapping = {}
    
    def is_root_node(self, node):
        return node == self.ast
    
    def root_scope(self):
        if self.parent_context is None:
            return self
        else:
            return self.parent_context.root_scope()
    
    def get_declaration(self, name):
        if name in self.declarations:
            return self.declarations[name]
        elif self.parent_context is not None:
            return self.parent_context.get_declaration(name)
        else:
            return None

    def block (self, body):
        if isinstance(body, list):
            # Wrap in a BlockStatement if multiple statements are present
            return merge_dicts(self.node(), {
                'type': 'BlockStatement',
                'body': body,
            })
        else:
            # Return the body node directly if it's not a list
            return body

    def construct_args(self, args):
        new_args = []
        i = 0
        while i < len(args):
            if args[i] == 'a' and i + 1 < len(args) and args[i + 1] == 'lda':
                new_args.extend(['a', 'strideA1', 'strideA2', 'offsetA'])
                self.variable_name_mapping['a'] = 'A'
                i += 2
            elif args[i] == 'b' and i + 1 < len(args) and args[i + 1] == 'ldb':
                new_args.extend(['b', 'strideB1', 'strideB2', 'offsetB'])
                self.variable_name_mapping['b'] = 'B'
                i += 2
            else:
                new_args.append(args[i])
                i += 1
        
        eprint(new_args)
        return new_args
    
    def parse_loop_control(self, ctrl):
        assert isinstance(ctrl, Loop_Control)
        assert len(ctrl.items) == 3

        if ctrl.items[0] is not None and ctrl.items[1] is None and ctrl.items[2] is None:
            return merge_dicts(self.node(), {
                'type': 'WhileStatement',
                'test': self._to_estree(ctrl.items[0]),
                'body': None
            })
        else:
            var = self._to_estree(ctrl.items[1][0])
            rng = ctrl.items[1][1]

            # Keep 1-based loop bounds (no reindexing). Stage 4 converts to 0-based.
            op = '<='
            try:
                inc = rng[2]
                if isinstance(inc, Level_2_Unary_Expr) and inc.items[0] == '-':
                    op = '>='
            except IndexError:
                inc = Int_Literal_Constant('1')

            start = self._to_estree(rng[0])
            end = self._to_estree(rng[1])

            return merge_dicts(self.node(), {
                'type': 'ForStatement',
                'init': {
                    'type': 'AssignmentExpression',
                    'operator': '=',
                    'left': var,
                    'right': start
                },
                'test': {
                    'type': 'BinaryExpression',
                    'left': var,
                    'operator': op,
                    'right': end
                },
                'update': {
                    'type': 'AssignmentExpression',
                    'operator': '+=',
                    'left': var,
                    'right': self._to_estree(inc)
                },
                'body': None
            })

    def to_estree(self):
        return self._to_estree(self.ast)
    
    def node(self, leading=True):
        tree = {}

        all_whitespace = all(re.match(r'^\s*$', str(comment)) for comment in self.comments)

        if self.output_comments and not all_whitespace:
            tree['leadingComments' if leading else 'trailingComments'] = [{
                'type': 'Line',
                'value': re.sub(r'^\*>|^\*', '', str(node))
            } for node in self.comments]
        self.comments = []
        return tree
    
    def _identifier(self, name, init=None):
        name = self.variable_name_mapping.get(name, name)
        output_name = name
        decl = self.get_declaration(name)
        if decl is not None and 'name' in decl:
            output_name = decl['name']
        tree = {
            'type': 'Identifier',
            'name': output_name
        }
        if init is not None:
            tree['init'] = init
        return tree

    def _to_estree (self, node):
        if isinstance(node, list):
            return filt([self._to_estree(child) for child in node])

        elif node is None:
            raise TypeError('Cannot convert None to ESTree')
        
        elif isinstance(node, Actual_Arg_Spec_List):
            return [self._to_estree(child) for child in node.children]

        elif isinstance(node, Add_Operand):
            return {
                'type': 'BinaryExpression',
                'left': self._to_estree(node.items[0]),
                'operator': LEVEL_2_OPERATORS[node.items[1]],
                'right': self._to_estree(node.items[2])
            }

        elif isinstance(node, And_Operand):
            return {
                'type': 'UnaryExpression',
                'operator': LEVEL_4_OPERATORS[node.items[0]],
                'argument': self._to_estree(node.items[1]),
                'prefix': True
            }

        elif isinstance(node, Block_Label_Do_Construct):
            if get_child(node, Label_Do_Stmt):
                label_do_stmt = get_child(node, Label_Do_Stmt)
                continue_stmt = get_child(node, Continue_Stmt)

                label_do_stmt_idx = index_of(node, label_do_stmt)
                continue_stmt_idx = index_of(node, continue_stmt)

                start_label = label_do_stmt.get_start_label()
                end_label = continue_stmt.get_end_label()

                assert start_label == end_label

                if label_do_stmt_idx > -1:
                    body = node.children[label_do_stmt_idx + 1: continue_stmt_idx]
                else:
                    raiseError('Unexpected structure in Block_Nonlabel_Do_Construct')

                loop_control = get_child(label_do_stmt, Loop_Control)
                assert isinstance(loop_control, Loop_Control)

                expr = self.parse_loop_control(loop_control)
                expr['body'] = self.block(self._to_estree(node.children[label_do_stmt_idx + 1: continue_stmt_idx]))
                return expr
            else:
                raise TypeError('Unhandled Block_Nonlabel_Do_Construct')

        elif isinstance(node, Block_Nonlabel_Do_Construct):
            if get_child(node, Nonlabel_Do_Stmt):
                nonlabel_do_stmt = get_child(node, Nonlabel_Do_Stmt)
                end_do_stmt = get_child(node, End_Do_Stmt)

                nonlabel_do_stmt_idx = index_of(node, nonlabel_do_stmt)
                end_do_stmt_idx = index_of(node, end_do_stmt)

                if nonlabel_do_stmt_idx > -1:
                    body = node.children[nonlabel_do_stmt_idx + 1: end_do_stmt_idx]
                else:
                    raiseError('Unexpected structure in Block_Nonlabel_Do_Construct')

                loop_control = get_child(nonlabel_do_stmt, Loop_Control)
                assert isinstance(loop_control, Loop_Control)

                expr = self.parse_loop_control(loop_control)
                expr['body'] = self.block(self._to_estree(node.children[nonlabel_do_stmt_idx + 1: end_do_stmt_idx]))
                return expr
            else:
                raise TypeError('Unhandled Block_Nonlabel_Do_Construct')

        elif isinstance(node, Assignment_Stmt):
            return merge_dicts(self.node(), {
                'type': 'ExpressionStatement',
                'expression': {
                    'type': 'AssignmentExpression',
                    'operator': ASSIGNMENT_OPERATORS[node.items[1]],
                    'left': self._to_estree(node.items[0]),
                    'right': self._to_estree(node.items[2]),
                }
            })

        elif isinstance(node, Call_Stmt):
            args = get_one_child(node, Actual_Arg_Spec_List)
            return {
                'type': 'CallExpression',
                'callee': self._to_estree(node.items[0]),
                'arguments': self._to_estree(args)
            }

        elif isinstance(node, Char_Literal_Constant):
            string = node.string.replace("'", '')
            return {
                'type': 'Literal',
                'value': string,
                'raw': string
            }

        elif isinstance(node, Comment):
            self.comments.append(node)
            return None

        elif isinstance(node, Complex_Literal_Constant):
            # (re, im) → [re, im] array literal
            re_part = parse_fortran_float(node.items[0].string)
            im_part = parse_fortran_float(node.items[1].string)
            return {
                'type': 'ArrayExpression',
                'elements': [
                    {'type': 'Literal', 'value': re_part, 'raw': str(re_part)},
                    {'type': 'Literal', 'value': im_part, 'raw': str(im_part)},
                ]
            }

        elif isinstance(node, Data_Stmt_Set):
            raise TypeError('Data_Stmt_Set should not be encountered')

        elif isinstance(node, Equiv_Operand):
            return {
                'type': 'BinaryExpression',
                'left': self._to_estree(node.items[0]),
                'operator': LEVEL_4_OPERATORS[node.items[1]],
                'right': self._to_estree(node.items[2])
            }

        elif isinstance(node, Execution_Part):
            return self._to_estree(node.children)

        elif isinstance(node, Function_Subprogram) or isinstance(node, Subroutine_Subprogram):
            if not self.is_root_node(node):
                # Create a new scope for subroutines
                return Scope(node, output_comments=self.output_comments).to_estree()

            assert_child_types(node, (Subroutine_Stmt, Function_Stmt, Specification_Part, Execution_Part, End_Function_Stmt, End_Subroutine_Stmt))

            func_node = self.node()

            Start_Type = Subroutine_Stmt if isinstance(node, Subroutine_Subprogram) else Function_Stmt
            End_Type = End_Subroutine_Stmt if isinstance(node, Subroutine_Subprogram) else End_Function_Stmt

            function_stmt = get_one_child(node, Start_Type)
            specification_part = get_one_child(node, Specification_Part)
            execution_part = get_child(node, Execution_Part)
            end_function_stmt = get_one_child(node, End_Type)

            function_name = function_stmt.get_name()
            if isinstance(node, Function_Subprogram):
                assert self.return_name is None
                self.return_name = function_name

            dummy_arg_list = get_child(function_stmt, Dummy_Arg_List)
            dummy_args = parse_dummy_arg_list(dummy_arg_list) if dummy_arg_list is not None else []
            (decls, consts, intrinsics, externals) = parse_spec(specification_part, self.comments)

            merge_dicts(self.declarations, decls)
            merge_dicts(self.constants, consts)
            merge_dicts(self.externals, externals)
            merge_dicts(self.intrinsics, intrinsics)

            body = []

            all_vars = list(set(list(decls.keys()) + list(consts.keys())))
            all_vars = [var for var in all_vars if var not in dummy_args]
            all_vars.sort(key=lambda x: (-len(x), x))

            body.extend([merge_dicts(self.node(), {
                'type': 'VariableDeclaration',
                'kind': 'var',
                'declarations': [self._identifier(var)]
            }) for var in all_vars])

            # Emit @complex directives as leading comments
            complex_vars = [name for name, d in decls.items() if d.get('type') == 'complex128']
            complex_scalars = [name for name in complex_vars
                               if not decls[name].get('shape')]
            complex_arrays = [name for name in complex_vars
                              if decls[name].get('shape')]
            if complex_vars:
                directives = []
                if complex_scalars:
                    directives.append({
                        'type': 'Block',
                        'value': ' @complex ' + ', '.join(sorted(complex_scalars)) + ' '
                    })
                if complex_arrays:
                    directives.append({
                        'type': 'Block',
                        'value': ' @complex-arrays ' + ', '.join(sorted(complex_arrays)) + ' '
                    })
                body.append({
                    'type': 'EmptyStatement',
                    'leadingComments': directives
                })

            for name, meta in consts.items():
                body.append(merge_dicts(self.node(), {
                    'type': 'ExpressionStatement',
                    'expression': {
                        'type': 'AssignmentExpression',
                        'operator': '=',
                        'left': self._identifier(name),
                        'right': {
                            'type': 'Literal',
                            'value': meta['value'],
                            'raw': str(meta['value'])
                        }
                    }
                }))

            if execution_part is not None:
                # Unwrap the execution part from a BlockStatement to avoid extra nesting
                body.extend(self._to_estree(execution_part))
            
            args = self.construct_args(dummy_args)
            
            result = merge_dicts(func_node, {
                "type": "FunctionDeclaration",
                "id": self._to_estree(function_name),
                "params": [self._identifier(arg) for arg in args],
                "body": {
                    "type": "BlockStatement",
                    "body": body,
                }
            })

            if len(result['body']['body']) > 0:
                merge_dicts(result['body']['body'][-1], self.node(False))
            
            return result
        
        elif isinstance(node, Level_2_Unary_Expr):
            assert len(node.items) == 2
            return {
                'type': 'UnaryExpression',
                'operator': UNARY_OPERATORS[node.items[0]],
                'argument': self._to_estree(node.items[1]),
                'prefix': True
            }

        elif isinstance(node, If_Stmt):
            assert len(node.items) == 2
            return merge_dicts(self.node(), {
                'type': 'IfStatement',
                'test': self._to_estree(node.items[0]),
                'consequent': self.block(self._to_estree(node.items[1])),
                'alternate': None
            })

        elif isinstance(node, If_Construct):
            indices = []
            for index, child in enumerate(node.children):
                if isinstance(child, (If_Then_Stmt, Else_Stmt, Else_If_Stmt, End_If_Stmt)):
                    indices.append(index)
                
            # Process any comments preceeding the initial If_Then_Stmt
            for i in range(indices[0]):
                self._to_estree(node.children[i])
            
            # Assert the sequence of if construct nodes is valid
            assert isinstance(node.children[indices[0]], If_Then_Stmt)
            assert isinstance(node.children[indices[-1]], End_If_Stmt)
            if len(indices) > 2:
                for idx in indices[1:-2]:
                    assert isinstance(node.children[idx], Else_If_Stmt)
                assert isinstance(node.children[indices[-2]], (If_Stmt, Else_Stmt, Else_If_Stmt))

            tree = None
            cur_tree = None

            for i in range(len(indices) - 1):
                start_idx, end_idx = indices[i], indices[i + 1]
                ctrl_node = node.children[start_idx]
                if isinstance(ctrl_node, If_Then_Stmt):
                    # Only one If_Then_Stmt should be at the start
                    assert cur_tree is None
                    tree = merge_dicts(self.node(), {
                        'type': 'IfStatement',
                        'test': self._to_estree(ctrl_node.items[0]),
                        'consequent': self.block(self._to_estree(node.children[start_idx + 1: end_idx])),
                        'alternate': None,
                    })
                    cur_tree = tree
                elif isinstance(ctrl_node, Else_If_Stmt):
                    assert cur_tree is not None
                    new_tree = merge_dicts(self.node(), {
                        'type': 'IfStatement',
                        'test': self._to_estree(ctrl_node.items[0]),
                        'consequent': self.block(self._to_estree(node.children[start_idx + 1: end_idx])),
                        'alternate': None
                    })
                    cur_tree['alternate'] = new_tree
                    cur_tree = new_tree
                elif isinstance(ctrl_node, Else_Stmt):
                    assert cur_tree is not None
                    cur_tree['alternate'] = self.block(self._to_estree(node.children[start_idx + 1: end_idx]))
                else:
                    raiseError('Unexpected structure in If_Construct')
            
            return tree

        elif isinstance(node, Int_Literal_Constant):
            return {
                'type': 'Literal',
                'value': int(node.string),
                'raw': node.string
            }

        elif isinstance(node, Intrinsic_Function_Reference):
            intrinsic_name = get_child(node, Intrinsic_Name)
            assert isinstance(intrinsic_name, Intrinsic_Name)
            func = intrinsic_name.string.lower()

            args = get_one_child(node, Actual_Arg_Spec_List)

            if func == 'mod':
                assert len(args.items) == 2
                lhs = args.items[0]
                rhs = args.items[1]
                return {
                    'type': 'BinaryExpression',
                    'left': self._to_estree(lhs),
                    'operator': '%',
                    'right': self._to_estree(rhs)
                }
            if func in ('dble', 'real', 'dreal'):
                # Type conversion to real — pass through (JS is already all doubles)
                assert len(args.items) >= 1
                return self._to_estree(args.items[0])
            if func in INTRINSIC_FUNCTIONS:
                return {
                    'type': 'CallExpression',
                    'callee': self._identifier(INTRINSIC_FUNCTIONS[func]),
                    'arguments': filt([self._to_estree(arg) for arg in args.items])
                }
            else:
                raise ValueError('Unhandled intrinsic function: %s' % func)

        elif isinstance(node, Intrinsic_Name):
            raise TypeError('Intrinsic_Name should not be encountered')
        
        elif isinstance(node, Intrinsic_Stmt):
            raise TypeError('Intrinsic_Stmt should not be encountered')


        elif isinstance(node, Level_2_Expr):
            return {
                'type': 'BinaryExpression',
                'left': self._to_estree(node.items[0]),
                'operator': LEVEL_2_OPERATORS[node.items[1]],
                'right': self._to_estree(node.items[2])
            }

        elif isinstance(node, Level_4_Expr):
            return {
                'type': 'BinaryExpression',
                'left': self._to_estree(node.items[0]),
                'operator': LEVEL_4_OPERATORS[node.items[1]],
                'right': self._to_estree(node.items[2])
            }
        
        elif isinstance(node, Logical_Literal_Constant):
            value = LOGICAL_LITERALS[node.string.upper()],
            return {
                'type': 'Literal',
                'value': value,
                'raw': str(value).lower(),
            }
        
        elif isinstance(node, Mult_Operand):
            assert len(node.items) == 3
            return {
                'type': 'BinaryExpression',
                'operator': LEVEL_2_OPERATORS[node.items[1]],
                'left': self._to_estree(node.items[0]),
                'right': self._to_estree(node.items[2])
            }

        elif isinstance(node, Name):
            return self._identifier(node.string.lower())
        
        elif isinstance(node, Or_Operand):
            return {
                'type': 'BinaryExpression',
                'left': self._to_estree(node.items[0]),
                'operator': LEVEL_4_OPERATORS[node.items[1]],
                'right': self._to_estree(node.items[2])
            }

        elif isinstance(node, Real_Literal_Constant):
            num = parse_fortran_float(node.string)
            return {
                'type': 'Literal',
                'value': num,
                'raw': str(num)
            }

        elif isinstance(node, Return_Stmt):
            # Fortran, we assume the return value is the function's name
            return merge_dicts(self.node(), {
                'type': 'ReturnStatement',
                'argument': None if self.return_name is None else self._to_estree(self.return_name)
            })
        
        elif isinstance(node, Parenthesis):
            assert len(node.items) == 3
            assert node.items[0] == '('
            assert node.items[2] == ')'
            return self._to_estree(node.items[1])
        
        elif isinstance(node, Program):
            body = self._to_estree(node.children)
            node = self.node()
            return merge_dicts(node, {
                'type': 'Program',
                'body': body
            })
        
        elif isinstance(node, Implicit_Part):
            return self._to_estree(node.children)

        elif isinstance(node, Specification_Part):
            return self._to_estree(node.children)
        
        elif isinstance(node, Type_Declaration_Stmt):
            raise TypeError('Type_Declaration_Stmt should not be encountered')

        elif isinstance(node, Part_Ref):
            name = get_child(node, Name)
            assert isinstance(name, Name)

            subs = get_child(node, Section_Subscript_List)
            assert isinstance(subs, Section_Subscript_List)

            name_str = name.string.lower()

            if name_str in self.externals or name_str in self.intrinsics or name_str in INTRINSIC_FUNCTIONS:
                # Function call (external or intrinsic)
                func_name = INTRINSIC_FUNCTIONS.get(name_str, name_str)
                return {
                    'type': 'CallExpression',
                    'callee': self._identifier(func_name),
                    'arguments': [self._to_estree(item) for item in subs.items]
                }
            else:
                decl = self.get_declaration(name_str)

                if decl is None:
                    raise ValueError('Variable %s not declared' % name_str)

                # Ensure the number of subscripts matches the declared dimensionality
                assert len(decl['shape']) == len(subs.items)

                idx = None
                dim = len(decl['shape'])

                # Construct a column-major index expression.
                # Subtract 1 from each subscript to convert from Fortran 1-based
                # to JS 0-based memory offsets. The (expr - 1) markers are visible
                # in stage 3 output; stage 4 simplifies them after converting
                # loops/variables to 0-based.
                for i, item in enumerate(reversed(subs.items)):
                    itree = self._to_estree(item)

                    # Subtract 1 from every subscript (literal or variable)
                    if itree['type'] == 'Literal':
                        itree['value'] -= 1
                        itree['raw'] = str(itree['value'])
                    else:
                        itree = {
                            'type': 'BinaryExpression',
                            'operator': '-',
                            'left': itree,
                            'right': {
                                'type': 'Literal',
                                'value': 1,
                                'raw': '1'
                            }
                        }

                    if idx is None:
                        idx = itree
                    else:
                        idx = {
                            'type': 'BinaryExpression',
                            'operator': '+',
                            'left': idx,
                            'right': {
                                'type': 'BinaryExpression',
                                'operator': '*',
                                'left': itree,
                                'right': self._identifier(decl['shape'][dim - i - 1]),
                            }
                        }
                    
                return {
                    'type': 'MemberExpression',
                    'computed': True,
                    'object': self._to_estree(name),
                    'property': idx
                }

        elif isinstance(node, Structure_Constructor):
            type_name = find_one(node, Type_Name)
            assert type_name.string.lower() == 'lsame'

            comp_spec_list = get_one_child(node, Component_Spec_List)
            name = get_one_child(comp_spec_list, Name)
            char = get_one_child(comp_spec_list, Char_Literal_Constant)

            return {
                'type': 'BinaryExpression',
                'operator': '===',
                'left': self._to_estree(name),
                'right': self._to_estree(char)
            }

        else:
            raise TypeError('Unrecognized node type: %s' % node.__class__.__name__)

            
class FortranTranslator:
    def __init__(self, code, output_comments=True):
        self.code = code
        self.output_comments = output_comments

        reader = FortranStringReader(code, ignore_comments=False)
        parser = ParserFactory().create(std="f2003")
        self.ast = parser(reader)
    
    def to_estree(self):
        return Scope(self.ast, output_comments=self.output_comments).to_estree()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Convert Fortran code to ESTree')
    parser.add_argument('filename', nargs='?', type=str, help='Fortran source file')
    parser.add_argument('--no-comments', action='store_true', default=False, help='Exclude comments from the output')
    args = parser.parse_args()

    if not args.filename and sys.stdin.isatty():
        eprint('Usage: python fortran_to_estree.py <filename> or pipe input to the script')
        sys.exit(1)
    
    if args.filename:
        with open(args.filename, 'rt') as f:
            code = f.read()
    else:
        code = sys.stdin.read()

    translator = FortranTranslator(code, output_comments=not args.no_comments)

    print(json.dumps(translator.to_estree(), indent=2))