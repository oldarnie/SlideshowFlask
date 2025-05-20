# SlideshowFlask

## Virtuelle Umgebung einrichten und aktivieren

```
python -m venv venv
venv\Scripts\activate
```

## Abhängigkeiten installieren

```
pip install -r requirements.txt
```

## Anwendung starten

```
export FLASK_APP=app.py      # macOS/Linux
set FLASK_APP=app.py         # Windows (CMD)
$env:FLASK_APP = "app.py"    # Windows (PowerShell)
```
Starte Flask:

`flask run`

