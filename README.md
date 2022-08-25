# VSCN Server

## Running


Create `.env` file in the root of the directory:

```
FLASK_MONGO_DB_URL=<url goes here>
MONGODB_DATABASE_NAME="vscn"
DEBUG=True/False
```

Execute following commands:

```bash
python3 -m venv venv

. venv/bin/activate

pip install -r requirements.txt

flask --app vscns.app --debug run -p 11001
```

If database doesn't exist, create indexes after initial load.
Connect to the database with mongosh and execute:

```js
db.matchers.createIndex( { products: 1 } )
db.cve.createIndex( { id: 1 } )
```


```bash
python setup.py bdist_wheel
docker build -t vscn/vscns:1.0.0 .
docker run -p 11001:11001 --env-file .env test/test:1.0.0
```