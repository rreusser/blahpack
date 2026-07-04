#!/usr/bin/env python3
"""Compact triage report from `bin/gate.js --json` output.

Usage:
    node bin/gate.js --all --fast --json > /tmp/gate.json
    python bin/gate-triage.py /tmp/gate.json [--check <id>] [--module <substr>]
        [--status fail|warn] [--limit N]

Default view emits, in this order:

1. Totals (categories + check-status tallies)
2. Failures clustered by check-id, with distinct-message rollup and
   a few sample modules per cluster
3. Top offenders: in-progress modules ranked by failure count

Drill-down flags:
    --check <id>       list every module that fails that check, with its message
    --module <substr>  list every check that fails for matching modules
    --status warn      report warnings instead of failures (or "all" for both)
    --limit N          cap rows in cluster/offender views (default 30)
"""
import argparse
import collections
import json
import re
import sys


def normalize_message(msg, max_len=100):
    """Collapse module-specific substrings so similar messages cluster."""
    if not msg:
        return ''
    s = re.sub(r'\b\d+\b', 'N', msg)
    s = re.sub(r'\s+', ' ', s).strip()
    return s if len(s) <= max_len else s[:max_len - 1] + '…'


def render_totals(data):
    t = data['totals']
    out = []
    out.append('=== GATE TRIAGE ===')
    out.append('Timestamp: ' + data.get('timestamp', '?'))
    out.append('Modules:   {} total | complete={} in-progress={} scaffold={}'.format(
        t['modules'], t['complete'], t['in-progress'], t['scaffold']))
    out.append('Checks:    pass={} fail={} warn={} skip={}'.format(
        t['checks_passed'], t['checks_failed'],
        t['checks_warned'], t['checks_skipped']))
    return '\n'.join(out)


def cluster_by_check(modules, status_filter):
    """Group failing/warning checks by id. Returns list of clusters sorted by
    descending count.

    Each cluster: {id, name, count, msg_groups: [(msg, [modules])]}
    """
    by_id = {}
    for m in modules:
        for c in m['checks']:
            if status_filter != 'all' and c['status'] != status_filter:
                continue
            if c['status'] not in ('fail', 'warn'):
                continue
            cluster = by_id.setdefault(c['id'], {
                'id': c['id'],
                'name': c['name'],
                'count': 0,
                'by_msg': collections.OrderedDict(),
            })
            cluster['count'] += 1
            key = normalize_message(c.get('message', ''))
            cluster['by_msg'].setdefault(key, []).append(m['module'])
    return sorted(by_id.values(), key=lambda x: -x['count'])


def render_cluster_view(modules, status_filter, limit, max_msg_per_cluster=4,
                        max_mods_per_msg=5):
    clusters = cluster_by_check(modules, status_filter)
    if not clusters:
        return '=== FAILURES BY CHECK ID ===\n(none)'
    out = ['=== FAILURES BY CHECK ID ===']
    for cluster in clusters[:limit]:
        out.append('')
        out.append('[{:>3}] {:<40s}  {}'.format(
            cluster['count'], cluster['id'], cluster['name']))
        msgs = sorted(cluster['by_msg'].items(),
                      key=lambda kv: -len(kv[1]))
        for msg, mods in msgs[:max_msg_per_cluster]:
            sample = ', '.join(m.replace('lib/', '') for m in mods[:max_mods_per_msg])
            extra = '' if len(mods) <= max_mods_per_msg else ' … (+{})'.format(
                len(mods) - max_mods_per_msg)
            label = '"{}"'.format(msg) if msg else '(no message)'
            out.append('   ({:>3}) {}'.format(len(mods), label))
            out.append('         {}{}'.format(sample, extra))
        leftover = len(msgs) - max_msg_per_cluster
        if leftover > 0:
            other_count = sum(len(mods) for _, mods in msgs[max_msg_per_cluster:])
            out.append('   ({:>3}) ... +{} other message variants'.format(
                other_count, leftover))
    if len(clusters) > limit:
        rem = len(clusters) - limit
        rem_count = sum(c['count'] for c in clusters[limit:])
        out.append('')
        out.append('... +{} more check-ids ({} total failing checks)'.format(rem, rem_count))
    return '\n'.join(out)


def render_top_offenders(modules, limit):
    """Rank in-progress modules by number of failing checks. Scaffold modules
    are expected to fail across the board; complete modules have none — both
    are noise in this view.
    """
    rows = []
    for m in modules:
        if m['category'] != 'in-progress':
            continue
        fails = [c for c in m['checks'] if c['status'] == 'fail']
        warns = [c for c in m['checks'] if c['status'] == 'warn']
        if not fails and not warns:
            continue
        rows.append((m['module'], fails, warns))
    rows.sort(key=lambda r: (-len(r[1]), -len(r[2])))
    out = ['=== TOP IN-PROGRESS OFFENDERS ===']
    if not rows:
        out.append('(none)')
        return '\n'.join(out)
    out.append('  fails warns  module                                          failing checks')
    for mod, fails, warns in rows[:limit]:
        ids = ', '.join(c['id'].split('.', 1)[-1] for c in fails[:5])
        if len(fails) > 5:
            ids += ', ...'
        out.append('   {:>3}    {:>3}   {:<48s} {}'.format(
            len(fails), len(warns), mod, ids))
    if len(rows) > limit:
        out.append('  ... +{} more'.format(len(rows) - limit))
    return '\n'.join(out)


def render_check_detail(modules, check_id, status_filter):
    out = ['=== CHECK DETAIL: {} ==='.format(check_id)]
    hits = []
    for m in modules:
        for c in m['checks']:
            if c['id'] != check_id:
                continue
            if status_filter != 'all' and c['status'] != status_filter:
                continue
            if c['status'] not in ('fail', 'warn'):
                continue
            hits.append((m['module'], c))
    out.append('  matching modules: {}'.format(len(hits)))
    out.append('')
    for mod, c in hits:
        out.append('{} [{}]'.format(mod, c['status']))
        if c.get('message'):
            out.append('  ' + c['message'])
        for loc in c.get('locations', []) or []:
            out.append('    ' + loc)
    return '\n'.join(out)


def render_module_detail(modules, substr, status_filter):
    out = ['=== MODULE DETAIL: matching "{}" ==='.format(substr)]
    matched = [m for m in modules if substr in m['module']]
    if not matched:
        out.append('(no modules match)')
        return '\n'.join(out)
    for m in matched:
        out.append('')
        out.append('{}  [{}]'.format(m['module'], m['category']))
        for c in m['checks']:
            if status_filter != 'all' and c['status'] != status_filter:
                continue
            if c['status'] not in ('fail', 'warn'):
                continue
            line = '  [{}] {}'.format(c['status'].upper(), c['id'])
            if c.get('message'):
                line += '  — ' + c['message']
            out.append(line)
    return '\n'.join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('json_path', nargs='?', default='/tmp/gate-full.json')
    ap.add_argument('--check', help='Drill into one check id')
    ap.add_argument('--module', help='Drill into modules matching substring')
    ap.add_argument('--status', default='fail',
                    choices=['fail', 'warn', 'all'],
                    help='Status filter (default: fail)')
    ap.add_argument('--limit', type=int, default=30,
                    help='Cap rows in cluster/offender views (default: 30)')
    args = ap.parse_args()

    with open(args.json_path) as f:
        data = json.load(f)

    print(render_totals(data))
    print()

    modules = data['modules']

    if args.check:
        print(render_check_detail(modules, args.check, args.status))
        return
    if args.module:
        print(render_module_detail(modules, args.module, args.status))
        return

    print(render_cluster_view(modules, args.status, args.limit))
    print()
    print(render_top_offenders(modules, args.limit))


if __name__ == '__main__':
    main()
