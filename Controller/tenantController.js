//Controller/tenantController.js
exports.dashboard = (req, res) => {
    res.render('tenant/dashboard', { title: 'Tenant Dashboard' });
};
