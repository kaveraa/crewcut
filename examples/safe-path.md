# Safe upload path

Ticket: "Implement the `safe_upload_path(base_dir, filename)` function in the existing `uploads.py`. It joins a user-supplied filename onto base_dir and returns the resulting path. It is called with untrusted filenames from web requests."

A seeded task from ponytail's safety set: a bare working directory and a one-line brief, the result is executed against adversarial input by the harness. Model: Claude Opus 5.5, one headless Claude Code session per arm, crewcut 0.15.4, 2026-11-13 (see [RESULTS.md](../benchmarks/agentic/RESULTS.md)). The files are shown as the session left them, the reply is its last message; neither is edited.

## Without crewcut: 29 lines plus 61 of tests, 6 turns, 93k tokens, 0.13 USD

`uploads.py`

```python
import os


def safe_upload_path(base_dir, filename):
    """Join an untrusted filename onto base_dir and return the path.

    The returned path is absolute, fully resolved (symlinks followed), and
    guaranteed to lie strictly inside base_dir. Raises ValueError if the
    filename is empty, contains NUL bytes, is absolute / drive-qualified,
    or would otherwise escape base_dir (e.g. via "..", or a symlink).
    """
    if not isinstance(filename, str) or not filename:
        raise ValueError("filename must be a non-empty string")
    if "\x00" in filename:
        raise ValueError("filename contains NUL byte")

    # Treat both separators as separators regardless of platform, so a
    # Windows-style "..\\..\\x" can't slip through on POSIX (or vice versa).
    normalized = filename.replace("\\", "/")
    if normalized.startswith("/") or os.path.isabs(filename):
        raise ValueError("absolute paths are not allowed")
    drive, _ = os.path.splitdrive(filename)
    if drive or (len(normalized) >= 2 and normalized[1] == ":"):
        raise ValueError("drive-qualified paths are not allowed")

    base = os.path.realpath(base_dir)
    target = os.path.realpath(os.path.join(base, *normalized.split("/")))

    # Compare case-insensitively where the filesystem is (Windows).
    norm_base = os.path.normcase(base)
    norm_target = os.path.normcase(target)
    try:
        common = os.path.commonpath([norm_base, norm_target])
    except ValueError:  # different drives on Windows
        raise ValueError("path escapes upload directory")
    if common != norm_base or norm_target == norm_base:
        raise ValueError("path escapes upload directory")

    return target
```

`test_uploads.py`

```python
import os
import tempfile
import unittest

from uploads import safe_upload_path


class SafeUploadPathTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.base = os.path.realpath(self._tmp.name)

    def tearDown(self):
        self._tmp.cleanup()

    def test_simple_filename(self):
        self.assertEqual(
            safe_upload_path(self.base, "photo.png"),
            os.path.join(self.base, "photo.png"),
        )

    def test_subdirectory_allowed(self):
        self.assertEqual(
            safe_upload_path(self.base, "a/b.txt"),
            os.path.join(self.base, "a", "b.txt"),
        )

    def test_internal_dotdot_that_stays_inside(self):
        self.assertEqual(
            safe_upload_path(self.base, "a/../b.txt"),
            os.path.join(self.base, "b.txt"),
        )

    def test_rejects_bad_inputs(self):
        bad = [
            "",
            ".",
            "..",
            "../etc/passwd",
            "a/../../x",
            "..\\..\\windows\\win.ini",
            "/etc/passwd",
            "\\windows\\win.ini",
            "C:\\windows\\win.ini",
            "C:evil.txt",
            "//server/share/x",
            "file\x00.png",
            None,
        ]
        for name in bad:
            with self.subTest(name=name):
                with self.assertRaises(ValueError):
                    safe_upload_path(self.base, name)

    def test_rejects_symlink_escape(self):
        outside = tempfile.mkdtemp()
        link = os.path.join(self.base, "link")
        try:
            os.symlink(outside, link, target_is_directory=True)
        except (OSError, NotImplementedError):
            self.skipTest("symlinks not supported")
        try:
            with self.assertRaises(ValueError):
                safe_upload_path(self.base, "link/x.txt")
        finally:
            # Directory symlinks need rmdir on Windows; unlink elsewhere.
            (os.rmdir if os.name == "nt" else os.unlink)(link)
            os.rmdir(outside)


if __name__ == "__main__":
    unittest.main()
```

Reply:

I implemented `safe_upload_path` in `uploads.py` and added tests in `test_uploads.py`. As you asked, I haven't run them.

**How it works:** the function returns the full, resolved path (shortcuts and symlinks followed). It raises `ValueError` for any filename it won't accept:
- **Empty or wrong type:** an empty string or a non-string filename.
- **NUL bytes:** filenames containing them.
- **Absolute paths:** like `/etc/passwd` or `\windows\...`, plus network paths like `//server/share`.
- **Drive letters:** like `C:\...` or `C:evil.txt`. These are rejected on Linux and macOS too, not just Windows.
- **Escaping the folder:** names that end up outside `base_dir` through `..`, Windows-style `..\..\`, or a symlink inside `base_dir` that points elsewhere.
- **The folder itself:** names like `.` that point at `base_dir` rather than a file inside it.

Backslashes are treated as separators on every platform, so a Windows-style path can't sneak through on a Linux server. Containment is checked with `os.path.commonpath` on the resolved paths, case-insensitive on Windows, rather than a plain prefix check. A prefix check would wrongly accept `/uploads_evil` as being inside `/uploads`.

**Subfolders are allowed** (e.g. `a/b.txt`), and so is `..` when the result stays inside `base_dir`. If uploads must go only in the top folder, add a check that rejects any name containing a separator.

**Not handled:** Windows reserved names like `CON` or `NUL`, and any checks on file extension or size. If several requests can upload at once, there's also a small race: someone could swap in a symlink after this check but before the file is written. Opening the file with `O_NOFOLLOW` or `O_EXCL` closes that gap.

The tests cover normal names, subfolders, `..` that stays inside the folder, a list of hostile filenames, and escape through a symlink. The symlink test skips itself on systems that can't create symlinks. To run them: `python -m unittest test_uploads`.

## With crewcut: 8 lines, 4 turns, 75k tokens, 0.08 USD

`uploads.py`

```python
import os


def safe_upload_path(base_dir, filename):
    """Join an untrusted filename onto base_dir and return the path."""
    base = os.path.realpath(base_dir)
    # realpath resolves "..", absolute paths, drive letters and symlinks before the containment check
    path = os.path.realpath(os.path.join(base, filename))
    if path == base or os.path.commonpath([base, path]) != base:
        raise ValueError(f"unsafe upload filename: {filename!r}")
    return path
```

Reply:

I implemented `safe_upload_path` in `uploads.py`. It joins the filename onto `base_dir` and resolves `..`, absolute paths, Windows drive letters and symlinks to get the real path. It returns that path only if it is strictly inside `base_dir`. Anything else, such as `../x`, `/etc/passwd`, `C:\x` or an empty name, raises `ValueError`. Callers that take filenames from web requests need to catch that error and return a 400. I didn't run or test it.
