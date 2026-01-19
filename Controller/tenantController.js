const userDAO = require('../models/userModel');
const listingDAO = require('../models/listingModel');
const messagesModel = require('../models/messagesModel');

exports.dashboard = async (req, res) => {
  try {
    const tenant = req.session.user.username;

    // 1️⃣ pobierz zapisane ID
    const savedIds = await new Promise((resolve) => {
      userDAO.getSavedListings(tenant, (err, ids) => {
        if (err) resolve([]);
        else resolve(ids);
      });
    });

    // 2️⃣ pobierz wszystkie listingi
    const allListings = await listingDAO.getAll();

    // 3️⃣ filtr + mapowanie do kart
    const savedListings = allListings
      .filter(l => savedIds.includes(l._id))
      .map(l => ({
        id: l._id,
        title: l.title,
        location: l.location,
        price: l.price,
        imageUrl:
          l.images && l.images.length > 0
            ? l.images[0].url
            : '/images/default-house.jpg'
      }));

    // messages
    const unreadCount = await new Promise((resolve) => {
      messagesModel.countUnread(tenant, (err, count) => {
        if (err) resolve(0);
        else resolve(count);
      });
    });

    res.render('tenant/dashboard', {
      title: 'Tenant Dashboard',
      user: req.session.user,
      savedListings,
      savedListingsCount: savedListings.length,
      applicationsSent: 0,
      messages: unreadCount
    });

  } catch (err) {
    console.error('❌ tenant dashboard error:', err);
    res.status(500).send('Server error');
  }
};
