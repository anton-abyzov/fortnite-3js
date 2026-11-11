"""Print node tree, mesh bounds and materials of .glb files. Usage: python3 -I tools/glb-tree.py file.glb [...]"""
import json, struct, sys

def read_glb(path):
    with open(path, 'rb') as f:
        f.read(12)
        clen, _ = struct.unpack('<II', f.read(8))
        return json.loads(f.read(clen))

for path in sys.argv[1:]:
    g = read_glb(path)
    acc = g.get('accessors', [])
    print('==', path.split('/')[-1], 'images:', [(i.get('name'), i.get('uri'), i.get('mimeType')) for i in g.get('images', [])], 'mats:', [m.get('name') for m in g.get('materials', [])])
    def walk(i, depth):
        n = g['nodes'][i]
        info = ''
        if 'mesh' in n:
            m = g['meshes'][n['mesh']]
            mn = [1e9]*3; mx = [-1e9]*3; v = 0
            for p in m['primitives']:
                a = acc[p['attributes']['POSITION']]
                v += a['count']
                for k in range(3):
                    mn[k] = min(mn[k], a['min'][k]); mx[k] = max(mx[k], a['max'][k])
            info = ' mesh v=%d min=(%.2f %.2f %.2f) max=(%.2f %.2f %.2f)' % (v, *mn, *mx)
        t = n.get('translation'); r = n.get('rotation'); s = n.get('scale')
        print('  ' * depth + '- %s%s%s%s%s' % (n.get('name'), ' t=%s' % [round(x, 3) for x in t] if t else '', ' r=%s' % [round(x, 3) for x in r] if r else '', ' s=%s' % [round(x, 3) for x in s] if s else '', info))
        for c in n.get('children', []):
            walk(c, depth + 1)
    for r in g['scenes'][g.get('scene', 0)]['nodes']:
        walk(r, 1)
