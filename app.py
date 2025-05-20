import os
import uuid
import json
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, session, jsonify, flash
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from logging import getLogger, FileHandler, Formatter

# Load config
load_dotenv()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")
SLIDESHOW_DURATION = int(os.getenv("SLIDESHOW_DURATION", "5"))

UPLOAD_FOLDER = os.path.join("static", "uploads")
LOG_FOLDER = os.path.join("logs")
IMAGES_JSON = "images.json"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(LOG_FOLDER):
    os.makedirs(LOG_FOLDER)

# Logging
logger = getLogger("diashow")
file_handler = FileHandler(os.path.join(LOG_FOLDER, "app.log"))
file_handler.setFormatter(Formatter('%(asctime)s %(levelname)s %(message)s'))
logger.addHandler(file_handler)
logger.setLevel("INFO")

app = Flask(__name__)
app.secret_key = os.urandom(24)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_images():
    if os.path.exists(IMAGES_JSON):
        with open(IMAGES_JSON, "r") as f:
            return json.load(f)
    return []

def save_images(images):
    with open(IMAGES_JSON, "w") as f:
        json.dump(images, f, indent=2)

def add_image(filename):
    images = load_images()
    images.append({"filename": filename, "enabled": True})
    save_images(images)

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

# Upload
@app.route("/upload", methods=["GET", "POST"])
def upload():
    if request.method == "POST":
        files = request.files.getlist("file")
        for file in files:
            if file and allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                filename = f"{uuid.uuid4().hex}.{ext}"
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                add_image(filename)
                logger.info(f"Uploaded: {filename}")
        flash("Upload erfolgreich!", "success")
        return redirect(url_for("upload"))
    return render_template("upload.html")

@app.route("/admin", methods=["GET", "POST"])
def admin():
    if request.method == "POST":
        password = request.form.get("password")
        if password == ADMIN_PASSWORD:
            session["admin"] = True
            return redirect(url_for("admin"))
        flash("Falsches Passwort!", "danger")
        return render_template("admin.html", login=True)

    if not session.get("admin"):
        return render_template("admin.html", login=True)

    images = load_images()
    legend_texts = ""
    try:
        with open("legend_texts.json", encoding="utf-8") as f:
            legend_texts = json.dumps(json.load(f), ensure_ascii=False, indent=2)
    except Exception:
        legend_texts = "[]"
    return render_template("admin.html", images=images, login=False, legend_texts=legend_texts)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("admin"))

# API: Bildstatus ändern
@app.route("/api/toggle_image", methods=["POST"])
def toggle_image():
    if not session.get("admin"):
        return "Unauthorized", 401
    filename = request.form.get("filename")
    images = load_images()
    for img in images:
        if img["filename"] == filename:
            img["enabled"] = not img["enabled"]
    save_images(images)
    return "OK"

# Slideshow-Frontend
@app.route("/slideshow")
def slideshow():

    logger.info(f"Diashow gestartet")

    with open("legend_texts.json", encoding="utf-8") as f:
        legend_sentences = json.load(f)

    logger.info(f"LegendSentences: {legend_sentences}")

    return render_template(
        "slideshow.html",
        legend_sentences=legend_sentences
    )

# API: Aktive Bilderliste
@app.route("/api/images")
def api_images():
    images = [img for img in load_images() if img["enabled"]]
    return jsonify(images)

# Direkter Bildzugriff (optional, via static/uploads/<filename>)
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/api/legend_texte")
def get_legend_texte():
    with open("legend_texts.json", encoding="utf-8") as f:
        texte = json.load(f)
    return jsonify(texte)

@app.route("/admin/edit_legend", methods=["POST"])
def edit_legend():
    if not session.get("admin"):
        return "Unauthorized", 401
    # Der Inhalt kommt als Text-String
    new_content = request.form.get("legend_texts")
    try:
        data = json.loads(new_content)
    except Exception as e:
        flash("Fehler im JSON-Format!", "danger")
        return redirect(url_for("admin"))

    with open("legend_texts.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    flash("Legendentexte gespeichert!", "success")
    return redirect(url_for("admin"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
