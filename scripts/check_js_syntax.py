#!/usr/bin/env python3
"""Check JavaScript/JSX syntax for the static thesis deck.

Uses project-local Python parser packages in .tools/python, so the check does
not require Node, Deno, Bun, or globally installed Python packages.
"""

from __future__ import annotations

import argparse
import pathlib
import sys


ROOT = pathlib.Path(__file__).resolve().parents[1]
LOCAL_SITE = ROOT / ".tools" / "python"
DEFAULT_GLOBS = (
    "*.js",
    "*.jsx",
    "src/**/*.js",
    "src/**/*.jsx",
    "scripts/**/*.js",
    "scripts/**/*.jsx",
)


def ensure_python_312() -> None:
    """Run this checker under Python 3.12.

    The vendored tree-sitter wheels in .tools/python are built for CPython 3.12,
    so some environments may pick an older interpreter by default.
    """

    if sys.version_info[:2] == (3, 12):
        return

    print(
        "This syntax check needs Python 3.12 because .tools/python contains\n"
        "CPython 3.12 wheels for tree_sitter and tree_sitter_javascript.\n"
        "Try:\n"
        "  bash -lc 'python3.12 scripts/check_js_syntax.py'\n"
        'or reinstall the packages with:\n'
        '  python3.12 -m pip install --target ".tools/python" '
        "tree_sitter tree_sitter_javascript",
        file=sys.stderr,
    )
    raise SystemExit(2)


def load_parser():
    if LOCAL_SITE.exists():
        sys.path.insert(0, str(LOCAL_SITE))
    try:
        from tree_sitter import Language, Parser  # type: ignore
        import tree_sitter_javascript as tsjs  # type: ignore
    except ModuleNotFoundError:
        print(
            "Missing parser packages: install them with\n"
            '  python3.12 -m pip install --target ".tools/python" '
            "tree_sitter tree_sitter_javascript",
            file=sys.stderr,
        )
        raise SystemExit(2)

    parser = Parser()
    parser.language = Language(tsjs.language())
    return parser


def iter_default_files() -> list[pathlib.Path]:
    files: set[pathlib.Path] = set()
    for pattern in DEFAULT_GLOBS:
        files.update(ROOT.glob(pattern))
    return sorted(
        path
        for path in files
        if path.is_file()
        and ".tools" not in path.parts
        and "node_modules" not in path.parts
        and "dist" not in path.parts
        and not path.name.startswith(".")
    )


def node_errors(node) -> list[str]:
    errors = []
    stack = [node]
    while stack:
        current = stack.pop()
        if current.type == "ERROR" or current.is_missing:
            row, col = current.start_point
            token = current.text.decode("utf-8", errors="replace") if current.text else ""
            token = token.strip().splitlines()[0] if token.strip() else current.type
            errors.append(f"line {row + 1}, column {col + 1}: {token}")
        stack.extend(reversed(current.children))
    return errors


def parse_file(parser, path: pathlib.Path) -> tuple[bool, str | None]:
    source = path.read_bytes()
    tree = parser.parse(source)
    errors = node_errors(tree.root_node)
    if errors:
        return False, "; ".join(errors[:5])
    return True, None


def main(argv: list[str] | None = None) -> int:
    ensure_python_312()

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "files",
        nargs="*",
        type=pathlib.Path,
        help="Specific JS/JSX files to check. Defaults to the deck scripts.",
    )
    args = parser.parse_args(argv)

    parser_impl = load_parser()
    files = [path.resolve() for path in args.files] if args.files else iter_default_files()
    if not files:
        print("No JS/JSX files found.")
        return 0

    failures = []
    for path in files:
        ok, error = parse_file(parser_impl, path)
        rel = path.relative_to(ROOT) if path.is_relative_to(ROOT) else path
        if ok:
            print(f"OK   {rel}")
        else:
            failures.append((rel, error))
            print(f"FAIL {rel}: {error}", file=sys.stderr)

    if failures:
        print(f"\n{len(failures)} file(s) failed JS syntax check.", file=sys.stderr)
        return 1

    print(f"\n{len(files)} file(s) passed JS syntax check.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
