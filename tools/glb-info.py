"""Inspect GLB binary headers, meshes, materials, textures, skins, and bounding boxes.

Usage:
  python3 -I tools/glb-info.py public/assets/models/*.glb
"""
import json
import struct
import sys


def read_glb(path: str) -> dict:
    with open(path, "rb") as handle:
        magic, version, total_len = struct.unpack("<III", handle.read(12))
        if magic != 0x46546C67:
            raise ValueError(f"{path}: invalid GLB magic {hex(magic)}")
        chunk_len, chunk_type = struct.unpack("<II", handle.read(8))
        if chunk_type != 0x4E4F534A:
            raise ValueError(f"{path}: first chunk is not JSON")
        payload = handle.read(chunk_len)
        data = json.loads(payload.decode("utf-8"))
        data["_byteLength"] = total_len
        data["_version"] = version
        return data


def summarize_glb(path: str) -> dict:
    g = read_glb(path)
    accessors = g.get("accessors", [])
    prim_count = 0
    vert_count = 0
    mins = [float("inf"), float("inf"), float("inf")]
    maxs = [float("-inf"), float("-inf"), float("-inf")]

    for mesh in g.get("meshes", []):
        for prim in mesh.get("primitives", []):
            prim_count += 1
            pos_idx = prim.get("attributes", {}).get("POSITION")
            if pos_idx is not None and pos_idx < len(accessors):
                acc = accessors[pos_idx]
                vert_count += acc.get("count", 0)
                acc_min = acc.get("min")
                acc_max = acc.get("max")
                if acc_min and acc_max and len(acc_min) == 3 and len(acc_max) == 3:
                    for axis in range(3):
                        mins[axis] = min(mins[axis], acc_min[axis])
                        maxs[axis] = max(maxs[axis], acc_max[axis])

    return {
        "path": path,
        "bytes": g["_byteLength"],
        "meshes": len(g.get("meshes", [])),
        "primitives": prim_count,
        "vertices": vert_count,
        "materials": len(g.get("materials", [])),
        "textures": len(g.get("textures", [])),
        "skins": len(g.get("skins", [])),
        "animations": len(g.get("animations", [])),
        "boundsMin": mins if mins[0] != float("inf") else [0, 0, 0],
        "boundsMax": maxs if maxs[0] != float("-inf") else [0, 0, 0],
    }


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        print(json.dumps(summarize_glb(arg), indent=2))
