const getShippingFee = () => {
  const configuredFee = Number(process.env.SHIPPING_FEE ?? 100);
  return Number.isFinite(configuredFee) && configuredFee >= 0 ? configuredFee : 100;
};

module.exports = { getShippingFee };
