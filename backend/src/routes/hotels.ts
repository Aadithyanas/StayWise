// backend/src/routes/hotels.ts
import { Router, Request, Response } from 'express';

const router = Router();

const SERP_API_KEY = process.env.SERP_API_KEY || "44a2256403bf99c07c0cd1e683aefe23d43f2c69cde0f54fed3459454f46874e";

router.get('/', async (req: Request, res: Response) => {
  try {
    const { location, checkIn, checkOut, adults = '2' } = req.query;

    // Validate required parameters
    if (!location || !checkIn || !checkOut) {
      return res.status(400).json({ 
        error: 'Missing required parameters: location, checkIn, checkOut' 
      });
    }

    // Build SerpAPI URL
    const serpUrl = new URL('https://serpapi.com/search.json');
    serpUrl.searchParams.set('engine', 'google_hotels');
    serpUrl.searchParams.set('q', location as string);
    serpUrl.searchParams.set('check_in_date', checkIn as string);
    serpUrl.searchParams.set('check_out_date', checkOut as string);
    serpUrl.searchParams.set('adults', adults as string);
    serpUrl.searchParams.set('currency', 'USD');
    serpUrl.searchParams.set('gl', 'us');
    serpUrl.searchParams.set('hl', 'en');
    serpUrl.searchParams.set('api_key', SERP_API_KEY);

    // Fetch from SerpAPI
    const response = await fetch(serpUrl.toString());
    
    if (!response.ok) {
      throw new Error(`SerpAPI Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Return the hotels data
    res.json(data);
  } catch (error) {
    console.error('Hotels API error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch hotels' 
    });
  }
});

export default router;