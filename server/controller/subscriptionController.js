const Plan = require('../models/Plan');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Stripe = require('stripe');
const { sendMail } = require('../utils/mailService');
const { paymentEmailTemplate } = require('../utils/templates/paymentConfirmation');

const stripe = Stripe(process.env.STRIPE_API_KEY);
// Create default plans if they don't exist
const createDefaultPlans = async () => {
  try {
    const plans = await Plan.find();
    if (plans.length === 0) {
      const servicesList = [
        'merge-pdf',
        'split-pdf',
        'remove-pages',
        'extract-pages',
        'organize-pdf',
        'rotate-pdf',
        'compress-pdf',
        'jpg-to-pdf',
        'word-to-pdf',
        'ppt-to-pdf',
        'excel-to-pdf',
        'html-to-pdf',
        'pdf-to-jpg',
        'pdf-to-word',
        'pdf-to-ppt',
        'pdf-to-excel',
        'pdf-to-pdfa',
        'view-metadata',
        'add-page-numbers',
        'add-watermark',
        'unlock-pdf',
        'protect-pdf',
        'compare-pdf',
        'pdf-to-text',
        'update-metadata',
          'pdf-voice-reader',
  'translate',
  'handwriting',
  'pdf-expire',
  'e-sign'
      ];

      const generateServiceQuotas = (monthly, annual) =>
        servicesList.map(service => ({
          name: service,
          monthlyQuota: monthly,
          annualQuota: annual
        }));

      const defaultPlans = [
        {
          name: 'Basic',
          monthlyFee: 0,
          annualFee: 0,
          maxImages: 10,
          maxFileSize: 5, // MB
          maxResolution: '1920x1080',
          services: generateServiceQuotas(3, 36)
        },
        {
          name: 'Developer',
          monthlyFee: 4.99,
          annualFee: 47.90,
          maxImages: 100,
          maxFileSize: 10, // MB
          maxResolution: '2560x1440',
          services: generateServiceQuotas(10, 120)
        },
        {
          name: 'Business',
          monthlyFee: 6.99,
          annualFee: 67.10,
          maxImages: -1, // unlimited
          maxFileSize: 20, // MB
          maxResolution: '3840x2160',
          services: generateServiceQuotas(-1, -1)
        }
      ];

      await Plan.insertMany(defaultPlans);
      console.log('Default plans created successfully');
    }
  } catch (err) {
    console.error('Error creating default plans:', err);
  }
};


// Call the function to create default plans
createDefaultPlans();
exports.getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    console.error('Error fetching plan:', err);
    res.status(500).json({ error: 'Server error fetching plan' });
  }
};
// Admin functions
exports.createPlan = async (req, res) => {
  try {
    const { name, monthlyFee, annualFee, services } = req.body;
    
    // Validate plan name
    if (!['Basic', 'Developer', 'Business'].includes(name)) {
      return res.status(400).json({ error: 'Invalid plan name' });
    }

    // Validate services
    const validServices = [
      'optimize-compress', 'optimize-upscale', 'optimize-remove-background',
      'create-meme', 'modify-resize', 'modify-crop',
      'modify-rotate', 'convert-to-jpg', 'convert-from-jpg',
      'convert-html-to-image', 'security-watermark', 'security-blur-face'
    ];

    for (const service of services) {
      if (!validServices.includes(service.name)) {
        return res.status(400).json({ error: `Invalid service: ${service.name}` });
      }
    }

    const plan = new Plan({
      name,
      monthlyFee,
      annualFee,
      services
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create plan' });
  }
};

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) {
    console.error('Error fetching plans:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const updated = await Plan.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update plan' });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    // Soft delete by setting isActive to false
    await Plan.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Plan deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete plan' });
  }
};

// User subscription functions
exports.subscribeToPlan = async (req, res) => {
  try {
    const { planId, subscriptionType } = req.body;
    const userId = req.user.id;

    // Validate subscription type
    if (!['monthly', 'annual'].includes(subscriptionType)) {
      return res.status(400).json({ error: 'Invalid subscription type' });
    }

    // Find the plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    if (subscriptionType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Update user's subscription using findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        currentPlan: planId,
        subscriptionType: subscriptionType,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        usage: plan.services.map(service => ({
          service: service.name,
          count: 0,
          lastReset: startDate
        }))
      },
      { new: true, runValidators: true }
    ).select('-password').populate('currentPlan');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Successfully subscribed to plan',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error subscribing to plan:', err);
    res.status(500).json({ error: 'Failed to subscribe to plan' });
  }
};

exports.checkUsage = async (req, res) => {
  try {
    const { service } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId).populate('currentPlan');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const serviceUsage = user.usage.find(u => u.service === service);
    if (!serviceUsage) {
      return res.status(404).json({ error: 'Service usage not found' });
    }

    const planService = user.currentPlan.services.find(s => s.name === service);
    if (!planService) {
      return res.status(404).json({ error: 'Service not found in plan' });
    }

    const quota = user.subscriptionType === 'annual' ? 
      planService.annualQuota : planService.monthlyQuota;

    res.json({
      used: serviceUsage.count,
      quota: quota,
      remaining: quota === -1 ? 'unlimited' : Math.max(0, quota - serviceUsage.count)
    });
  } catch (err) {
    console.error('Error checking usage:', err);
    res.status(500).json({ error: 'Failed to check usage' });
  }
};

exports.incrementUsage = async (req, res) => {
  try {
    const { service } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const serviceUsage = user.usage.find(u => u.service === service);
    if (!serviceUsage) {
      return res.status(404).json({ error: 'Service usage not found' });
    }

    serviceUsage.count += 1;
    await user.save();

    res.json({ message: 'Usage incremented successfully', count: serviceUsage.count });
  } catch (err) {
    console.error('Error incrementing usage:', err);
    res.status(500).json({ error: 'Failed to increment usage' });
  }
};
exports.createCheckoutSession = async (req, res) => {
  const { planId, billingType } = req.body;

  try {
    const plan = await Plan.findById(planId);
    const amount = billingType === 'monthly' ? plan.monthlyFee : plan.annualFee;

   const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'payment',
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: { name: `${plan.name} (${billingType})` },
      unit_amount: Math.round(amount * 100)
    },
    quantity: 1,
  }],
  metadata: {
    planId,
    billingType,
    userId: req.user._id.toString() // used in checkout.session.completed
  },
  payment_intent_data: {
    metadata: {
      planId,
      billingType,
      userId: req.user._id.toString() // used in charge.succeeded, etc.
    }
  },
  success_url: `${process.env.CLIENT_URL}/success`,
  cancel_url: `${process.env.CLIENT_URL}/cancel`,
});
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Checkout session failed' });
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = Stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
console.log("event",event);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const {
      userId,
      planId,
      billingType
    } = session.metadata || {};

    try {
      const plan = await Plan.findById(planId);
      if (!plan) {
        console.error('⚠️ Plan not found');
        return res.status(404).send('Plan not found');
      }

      const durationInMs = billingType === 'annual'
        ? 365 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;

      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + durationInMs);

      const subscription = new Subscription({
        user: userId,
        plan: planId,
        billingType,
        amountPaid: session.amount_total / 100, // Stripe uses cents
        currency: session.currency,
        chargeId: session.payment_intent,
        paymentStatus: session.payment_status,
        paymentMethod: session.payment_method_types?.[0] || 'unknown',
        startDate,
        endDate
      });

      await subscription.save();

      // Update user document
      await User.findByIdAndUpdate(userId, {
        currentPlan: planId,
        subscriptionType: billingType,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate
      });


      console.log('✅ Subscription and user updated successfully');
      return res.status(200).json({ received: true });
    } catch (err) {
      console.error('❌ Error saving subscription:', err);
      return res.status(500).json({ error: 'Server error during webhook processing' });
    }
  }
   if (event.type === 'charge.succeeded') {
    const charge = event.data.object;
    console.log("charge",charge);
    

       let metadata = {};
    if (charge.payment_intent) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent);
        metadata = paymentIntent.metadata || {};
      } catch (err) {
        console.error('Failed to fetch PaymentIntent metadata:', err);
      }
    }
    console.log("metadata",metadata);
    
    const userId = metadata.userId;
    const planId = metadata.planId;
    const billingType = metadata.billingType;

    if (!userId || !planId || !billingType) {
     return res.status(400).json({ error: 'Missing metadata (userId, planId, billingType)' });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + (billingType === 'annual' ? 1 : 0));
    endDate.setMonth(endDate.getMonth() + (billingType === 'monthly' ? 1 : 0));

    const paymentData = {
      chargeId: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      billingDetails: {
        name: charge.billing_details.name,
        email: charge.billing_details.email,
        country: charge.billing_details.address?.country || null
      },
      paymentMethod: {
        brand: charge.payment_method_details.card?.brand,
        last4: charge.payment_method_details.card?.last4,
        expMonth: charge.payment_method_details.card?.exp_month,
        expYear: charge.payment_method_details.card?.exp_year,
        funding: charge.payment_method_details.card?.funding,
        country: charge.payment_method_details.card?.country
      },
      receiptUrl: charge.receipt_url,
      status: charge.status,
      userId,
      planId,
      billingType,
      billingCycle: {
        startDate,
        endDate
      }
    };
    const user=await User.findById(userId)
console.log("paymentData",paymentData);

    try {
      await Payment.create(paymentData);
            await sendMail(
  user?.email,
  'Payment Confirmation - PdfPivot',
  paymentEmailTemplate(paymentData)
);
      console.log('✅ Payment saved');
    } catch (error) {
      console.error('❌ Error saving payment:', error);
    }
  }
  res.status(200).json({ received: true });
};