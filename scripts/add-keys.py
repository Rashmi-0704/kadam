import json, sys
p = "src/lib/i18n/locales/en.json"
en = json.load(open(p, encoding="utf8"))
add = json.load(open(sys.argv[1], encoding="utf8"))
en.update(add)
json.dump(en, open(p, "w", encoding="utf8"), ensure_ascii=False, indent=2)
print(len(en), "keys")
