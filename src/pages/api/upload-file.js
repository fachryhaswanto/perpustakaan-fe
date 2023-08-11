import { Storage } from '@google-cloud/storage';

export default async function handler(req, res) {
  const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY,
      client_id: process.env.CLIENT_ID
    }
  });

  await storage.bucket(process.env.BUCKET_NAME).setCorsConfiguration([
    {
      origin: [
        'http://localhost:3000',
        'http://localhost:5000'
      ],
      method: ['POST', 'GET', 'DELETE'],
      maxAgeSeconds: 3600,
      responseHeader: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ]
    }
  ]);

  const bucket = storage.bucket(process.env.BUCKET_NAME);

  if (req.method === 'GET') {
    const file = bucket.file(req.query.file);
    const options = {
      expires: Date.now() + 3 * 60 * 1000, //  1 minute,
      fields: { 'x-goog-meta-test': 'data' }
    };

    const [response] = await file.generateSignedPostPolicyV4(options);
    res.status(200).json(response);
  } else if (req.method === 'DELETE') {
    // Delete Object
    try {     

      await bucket.file(req.query.file).delete();
      res.status(200).json({
        message: `gs://${process.env.BUCKET_NAME}/${req.query.file} deleted`
      });
    } catch (error) {
      res.status(400).json(error);
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
