"""
Minimal Flask image upload server matching the email builder image-uploader plugin.

    pip install flask flask-cors python-magic
    python python.py

POST /upload   multipart/form-data, field "file"
200            {"url": "/uploads/<name>"}
4xx/5xx        {"error": "..."}
"""

import os
import secrets

import magic  # python-magic; needs libmagic installed (brew install libmagic on macOS)
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
PUBLIC_BASE = "/uploads"
MAX_BYTES = 10 * 1024 * 1024
ALLOWED = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
}

os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_BYTES
CORS(app)  # restrict origin in production


@app.errorhandler(413)
def too_large(_):
    return jsonify(error="File too large"), 413


@app.route(f"{PUBLIC_BASE}/<path:name>")
def serve_upload(name: str):
    return send_from_directory(UPLOAD_DIR, name)


@app.post("/upload")
def upload():
    f = request.files.get("file")
    if f is None:
        return jsonify(error='Missing "file" field'), 400

    blob = f.read()
    mime = magic.from_buffer(blob, mime=True) or ""
    ext = ALLOWED.get(mime)
    if ext is None:
        return jsonify(error=f"Unsupported image type: {mime or 'unknown'}"), 415

    name = secrets.token_hex(12) + "." + ext
    with open(os.path.join(UPLOAD_DIR, name), "wb") as out:
        out.write(blob)

    return jsonify(url=f"{PUBLIC_BASE}/{name}")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 3000)))
