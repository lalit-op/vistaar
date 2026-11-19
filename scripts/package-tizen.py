"""Stage the shared TV UI and create an unsigned widget for local Samsung signing."""
from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'build' / 'tizen'
STAGE = OUTPUT / 'widget'
STAGE.mkdir(parents=True, exist_ok=True)
html = (ROOT / 'app/index.html').read_text(encoding='utf-8')
marker = '<!-- standalone Samsung scripts -->'
if html.count(marker) != 1:
    raise ValueError('Missing widget script insertion point')
scripts = ('<script src="$WEBAPIS/webapis/webapis.js"></script>\n'
           '<script src="samsung.js"></script>')
assets = {
    'index.html': html.replace(marker, scripts).encode('utf-8'),
    'samsung.js': (ROOT / 'tizen/samsung.js').read_bytes(),
    'config.xml': (ROOT / 'tizen/config.xml').read_bytes(),
    'icon.png': (ROOT / 'app/src/main/res/mipmap-xxxhdpi/ic_launcher.png').read_bytes(),
}
for vendor_file in ('hls.light-1.6.13.min.js', 'hls-LICENSE.txt'):
    assets['vendor/' + vendor_file] = (ROOT / 'app/vendor' / vendor_file).read_bytes()
manifest = ElementTree.fromstring(assets['config.xml'])
for tag in ('content', 'icon'):
    assert manifest.find('{http://www.w3.org/ns/widgets}' + tag).attrib['src'] in assets
# Keep staging free of stale files or signatures from a previous SDK invocation.
extra = {p.relative_to(STAGE).as_posix() for p in STAGE.rglob('*') if p.is_file()} - assets.keys()
if extra:
    raise SystemExit('Move previous output out of ' + str(STAGE) + ' before packaging: ' + ', '.join(sorted(extra)))
destination = OUTPUT / 'Vistaar-unsigned.wgt'
with ZipFile(destination, 'w', compression=ZIP_DEFLATED) as widget:
    for name, data in assets.items():
        (STAGE / name).parent.mkdir(parents=True, exist_ok=True)
        (STAGE / name).write_bytes(data)
        info = ZipInfo(name)  # Fixed timestamp keeps the downloadable build reproducible.
        info.external_attr = 0o100644 << 16
        widget.writestr(info, data, compress_type=ZIP_DEFLATED)
print(destination)
