"""Print the JSON summary of a .glb: meshes, skins, joints, animations. Usage: python3 -I tools/glb-info.py file.glb"""
import json, struct, sys

def read_glb(path):
    with open(path, 'rb') as f:
        magic, version, length = struct.unpack('<III', f.read(12))
        assert magic == 0x46546C67, 'not a glb'
        clen, ctype = struct.unpack('<II', f.read(8))
        return json.loads(f.read(clen))

for path in sys.argv[1:]:
    g = read_glb(path)
    print('==', path)
    print('meshes:', [m.get('name') for m in g.get('meshes', [])])
    print('materials:', [m.get('name') for m in g.get('materials', [])])
    print('images:', len(g.get('images', [])), 'textures:', len(g.get('textures', [])))
    for s in g.get('skins', []):
        names = [g['nodes'][j].get('name') for j in s['joints']]
        print('skin', s.get('name'), len(names), 'joints:', names)
    acc = g.get('accessors', [])
    anims = []
    for a in g.get('animations', []):
        dur = 0.0
        for s in a['samplers']:
            mx = acc[s['input']].get('max', [0])[0]
            dur = max(dur, mx)
        anims.append('%s(%.2fs)' % (a.get('name'), dur))
    print('animations', len(anims), ':', ', '.join(anims))
    prim = sum(len(m['primitives']) for m in g.get('meshes', []))
    verts = 0
    for m in g.get('meshes', []):
        for p in m['primitives']:
            verts += acc[p['attributes']['POSITION']]['count']
    print('primitives', prim, 'verts', verts)
    roots = g['scenes'][g.get('scene', 0)]['nodes']
    print('scene roots:', [g['nodes'][r].get('name') for r in roots])
