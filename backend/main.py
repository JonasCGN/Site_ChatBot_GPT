from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT") 

print(f"Connecting to PostgreSQL at {POSTGRES_HOST}:{POSTGRES_PORT} with user {POSTGRES_USER}")

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Mensagem(db.Model):
    __tablename__ = 'mensagem'
    id = db.Column(db.Integer, primary_key=True)
    conteudo = db.Column(db.Text, nullable=False)

class Resposta(db.Model):
    __tablename__ = 'resposta'
    id = db.Column(db.Integer, primary_key=True)
    id_mensagem = db.Column(db.Integer, db.ForeignKey('mensagem.id', ondelete='CASCADE'), nullable=False)
    pensamento = db.Column(db.Text, nullable=False)
    conteudo = db.Column(db.Text, nullable=False)

@app.route('/messages', methods=['POST'])
def create_message():
    data = request.get_json()
    if not data or 'content' not in data:
        return jsonify({'error': 'Message content is required'}), 400

    mensagem = Mensagem(conteudo=data['content'])
    db.session.add(mensagem)
    db.session.commit()

    return jsonify({'id': mensagem.id, 'content': mensagem.conteudo}), 201

@app.route('/messages', methods=['GET'])
def get_messages():
    mensagens = Mensagem.query.all()
    return jsonify([{'id': m.id, 'content': m.conteudo} for m in mensagens])

@app.route('/messages/<int:message_id>', methods=['GET'])
def get_message(message_id):
    mensagem = Mensagem.query.get(message_id)
    if not mensagem:
        return jsonify({'error': 'Message not found'}), 404
    return jsonify({'id': mensagem.id, 'content': mensagem.conteudo})

@app.route('/messages/<int:message_id>', methods=['PUT'])
def update_message(message_id):
    data = request.get_json()
    if not data or 'content' not in data:
        return jsonify({'error': 'Message content is required'}), 400

    mensagem = Mensagem.query.get(message_id)
    if not mensagem:
        return jsonify({'error': 'Message not found'}), 404

    mensagem.conteudo = data['content']
    db.session.commit()
    return jsonify({'id': mensagem.id, 'content': mensagem.conteudo})

@app.route('/messages/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    mensagem = Mensagem.query.get(message_id)
    if not mensagem:
        return jsonify({'error': 'Message not found'}), 404

    db.session.delete(mensagem)
    db.session.commit()
    return jsonify({'result': True})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0')
