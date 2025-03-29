import face_recognition
import numpy as np
from PIL import Image
import json

def get_face_embeddings(image_path: str) -> list[list[float]]:
    """
    Detect all faces in an image and return their embeddings.
    Returns a list of embeddings (one per face).
    """
    image = face_recognition.load_image_file(image_path)
    face_locations = face_recognition.face_locations(image, model="cnn")  # Detect all faces
    if not face_locations:
        raise ValueError("No faces detected in the image")
    face_encodings = face_recognition.face_encodings(image, face_locations, num_jitters=10)
    return [encoding.tolist() for encoding in face_encodings]

def batch_verify_faces(image_path: str, stored_embeddings: list[str], tolerance: float = 0.6) -> list[tuple[int, bool]]:
    """
    Verify multiple faces against stored embeddings.
    Returns a list of (index, match) tuples for each detected face.
    """
    new_embeddings = get_face_embeddings(image_path)
    stored_embeddings_np = [np.array(json.loads(emb)) for emb in stored_embeddings]
    results = []
    
    for new_embedding in new_embeddings:
        matches = face_recognition.compare_faces(stored_embeddings_np, np.array(new_embedding), tolerance=tolerance)
        match_found = False
        for idx, match in enumerate(matches):
            if match:
                results.append((idx, True))
                match_found = True
                break
        if not match_found:
            results.append((-1, False))  # No match for this face
    
    return results