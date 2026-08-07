import re


def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\x00", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    
    lines = []
    for line in text.splitlines():
        match = re.match(r"^([ \t]*)", line)
        indent = match.group(1) if match else ""
        content = line[len(indent):]
        cleaned_content = re.sub(r"[ \t]+", " ", content)
        lines.append(indent + cleaned_content)
        
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
        
    lines = [line.rstrip() for line in lines]
    return "\n".join(lines)

def process_latex(text: str) -> str:
    if not text:
        return text

    text = re.sub(r"\\\[(.*?)\\\]", r"$$\1$$", text, flags=re.DOTALL)
    text = re.sub(r"\\\((.*?)\\\)", r"$\1$", text, flags=re.DOTALL)

    display = r"equation|align|gather|displaymath|eqnarray|multline|flalign|split"
    text = re.sub(
        rf"\\begin{{({display})\*?}}(.*?)\\end{{\1\*?}}",
        r"$$\2$$",
        text,
        flags=re.DOTALL,
    )

    matrix = r"matrix|pmatrix|bmatrix|vmatrix|Bmatrix|cases|array"
    text = re.sub(
        rf"(?<!\$)\\begin{{({matrix})\*?}}(.*?)\\end{{\1\*?}}",
        r"$$\\begin{\1}\2\\end{\1}$$",
        text,
        flags=re.DOTALL,
    )

    return re.sub(r"\${3,}", "$$", text)
