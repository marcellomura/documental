import sys, re, subprocess
pdf = sys.argv[1]
n = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
for p in range(2, n + 1):
    t = subprocess.run(["pdftotext", "-layout", "-f", str(p), "-l", str(p), pdf, "-"], capture_output=True, text=True).stdout
    for line in t.splitlines():
        s = line.strip()
        if re.match(r"^(INT\.|EXT\.|INT\./EXT\.|MONTAJE)", s):
            print(f"p{p-1:>3}  {s}")
