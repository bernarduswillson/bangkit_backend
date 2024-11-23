import { Firestore } from '@google-cloud/firestore';
import path from 'path';

// Initialize Firestore
export const firestore = new Firestore({
  projectId: 'capstone-project-442502',
  // eslint-disable-next-line no-undef
  keyFilename: path.join(__dirname, 'service-account.json'),
  databaseId: 'bangkit-db'
});

// Save a document to a collection
export const save = async (collection: string, data: { docName: string, [key: string]: unknown }): Promise<void> => {
  const docRef = firestore.collection(collection).doc(data.docName);
  await docRef.set(data);
};

// Save a document in a sub-collection
export const saveSubCollection = async (
  rootCol: string,
  rootDocName: string,
  subCol: string,
  subColData: { docName: string, [key: string]: unknown }
): Promise<void> => {
  const docRef = firestore
    .collection(rootCol)
    .doc(rootDocName)
    .collection(subCol)
    .doc(subColData.docName);
  await docRef.set(subColData);
};

// Save a document using a full Firestore path
export const saveByPath = async (path: string, data: { [key: string]: unknown }): Promise<void> => {
  const docRef = firestore.doc(path);
  await docRef.set(data);
};
