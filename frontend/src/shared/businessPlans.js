// Indicative business concepts only. There is no automated checkout or billing in the current app.
export const businessPlans = [{
  id: 'purchase',
  eyebrow: 'Own your device',
  title: 'Device Purchase',
  price: 'Request quote',
  period: '',
  text: 'Ask about purchasing a SoilSense scanner and receiving device setup guidance.',
  features: ['One SoilSense sensing device', 'Android APK download', 'Setup and orientation', 'Admin-managed device assignment'],
  action: 'Inquire about purchase',
  featured: false
}, {
  id: 'access',
  eyebrow: 'Proposed monthly plan',
  title: 'SoilSense Access',
  price: '₱499',
  period: '/month',
  text: 'Proposed subscription concept for farmers with access to a SoilSense device.',
  features: ['Android mobile monitoring', 'Private soil scan history', 'AI crop ranking and smart crop plan', 'Device onboarding guidance'],
  action: 'Ask about subscription',
  featured: false
}, {
  id: 'rent',
  eyebrow: 'Proposed installment option',
  title: 'Rent-to-Own',
  price: '₱1,499',
  period: '/month',
  text: 'Proposed rent-to-own concept. Availability, terms, and device ownership are subject to confirmation.',
  features: ['Portable SoilSense device', 'Mobile app access', 'Admin-guided setup', 'Proposed 18-month ownership term'],
  action: 'Ask about rent-to-own',
  featured: true
}, {
  id: 'organizations',
  eyebrow: 'For teams & institutions',
  title: 'Cooperative / School',
  price: 'Custom',
  period: '',
  text: 'Discuss a possible SoilSense deployment for cooperatives, schools, and agricultural groups.',
  features: ['Device deployment discussion', 'User onboarding', 'Training and deployment options', 'Custom proposal on request'],
  action: 'Request information',
  featured: false
}];
