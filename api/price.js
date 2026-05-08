export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { ticker, type } = req.query;
  
  try {
    if (type === 'coin') {
      if (ticker.startsWith('KRW-')) {
        const r = await fetch(`https://api.upbit.com/v1/ticker?markets=${ticker}`);
        const d = await r.json();
        return res.json({ price: d[0].trade_price });
      } else {
        const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ticker}&vs_currencies=krw`);
        const d = await r.json();
        return res.json({ price: d[ticker]?.krw || null });
      }
    } else {
      const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`);
      const d = await r.json();
      const price = d?.chart?.result?.[0]?.meta?.regularMarketPrice;
      const currency = d?.chart?.result?.[0]?.meta?.currency;
      
      if (!price) return res.json({ price: null });
      
      if (currency === 'USD') {
        const fx = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDKRW=X?interval=1d&range=1d');
        const fd = await fx.json();
        const rate = fd?.chart?.result?.[0]?.meta?.regularMarketPrice || 1350;
        return res.json({ price: Math.round(price * rate) });
      }
      return res.json({ price: Math.round(price) });
    }
  } catch (e) {
    return res.status(500).json({ price: null });
  }
}