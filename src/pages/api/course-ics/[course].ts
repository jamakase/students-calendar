import type { NextApiRequest, NextApiResponse } from 'next';
import { getCourseICS } from '../../../docs/sheet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { course } = req.query;

  if (!course || typeof course !== 'string') {
    res.status(400).send('Bad Request: course parameter is required.');
    return;
  }

  try {
    const icsData = await getCourseICS(course);
    res.setHeader('Content-Type', 'text/calendar');
    res.status(200).send(icsData);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
} 