const asyncHandler = require('express-async-handler');
const Plan = require('../models/Plan');

// Function to remove create-photo-editor from existing plans
const removePhotoEditorService = async () => {
  try {
    const plans = await Plan.find({});
    for (const plan of plans) {
      plan.services = plan.services.filter(service => service.name !== 'create-photo-editor');
      await plan.save();
    }
    console.log('Successfully removed create-photo-editor service from all plans');
  } catch (err) {
    console.error('Error removing create-photo-editor service:', err);
  }
};

// Call this function when the server starts
removePhotoEditorService();

// @desc    Create a new subscription plan
// @route   POST /api/subscriptions/plans
// @access  Private/Admin
const createPlan = asyncHandler(async (req, res) => {
    const { name, monthlyFee, annualFee, features, services } = req.body;

    // Validate required fields
    if (!name || monthlyFee === undefined || annualFee === undefined || !features || !services) {
        res.status(400);
        throw new Error('Please provide all required fields: name, monthlyFee, annualFee, features, services');
    }

    // Check if plan with same name exists
    const existingPlan = await Plan.findOne({ name });
    if (existingPlan) {
        res.status(400);
        throw new Error('A plan with this name already exists');
    }

    // Create new plan
    const plan = await Plan.create({
        name,
        monthlyFee,
        annualFee,
        features,
        services
    });

    if (plan) {
        res.status(201).json(plan);
    } else {
        res.status(400);
        throw new Error('Invalid plan data');
    }
});

// @desc    Get all subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
const getPlans = asyncHandler(async (req, res) => {
    const plans = await Plan.find({});
    res.json(plans);
});

// @desc    Update a subscription plan
// @route   PUT /api/subscriptions/plans/:id
// @access  Private/Admin
const updatePlan = asyncHandler(async (req, res) => {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }

    const { name, monthlyFee, annualFee, features, services } = req.body;

    // If updating name, check if new name already exists
    if (name && name !== plan.name) {
        const existingPlan = await Plan.findOne({ name });
        if (existingPlan) {
            res.status(400);
            throw new Error('A plan with this name already exists');
        }
    }

    plan.name = name || plan.name;
    plan.monthlyFee = monthlyFee !== undefined ? monthlyFee : plan.monthlyFee;
    plan.annualFee = annualFee !== undefined ? annualFee : plan.annualFee;
    plan.features = features || plan.features;
    plan.services = services || plan.services;

    const updatedPlan = await plan.save();
    res.json(updatedPlan);
});

// @desc    Delete a subscription plan
// @route   DELETE /api/subscriptions/plans/:id
// @access  Private/Admin
const deletePlan = asyncHandler(async (req, res) => {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }

    await plan.deleteOne();
    res.json({ message: 'Plan removed' });
});

module.exports = {
    createPlan,
    getPlans,
    updatePlan,
    deletePlan
}; 