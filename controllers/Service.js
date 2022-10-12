const express = require('express')
const Service = require("../models/Service");
const { success, fail, sendError } = require('../function/respond')

const createService = async (req, res) => {
    const { title, desc, icon } = req.body;
    const newService = new Service({
        title,
        desc,
        icon
    });
    try {
        const service = await newService.save();
        return success(res, 201, service, "Service added successful")
    } catch (error) {
        return sendError(res, 500, null, error.message)
    }
}

const getServices = async (req, res) => {
    try {
        const service = await Service.find().sort("-createdAt");
        return success(res, 200, service, "retrieved Services")
    } catch (error) {
        return sendError(res, 500, null, error.message)
    }
}

const getService = async (req, res) => {
    const id = req.params.id;
    try {
        const service = await Service.findById(id)
        if (!id) return fail(res, 400, null, "Wrong Id");
        return success(res, 200, service, "retrieved Communities")
    } catch (error) {
        return sendError(res, 500, null, error.message)
    }
}

const deleteService = async (req, res) => {
    const id = req.params.id;
    try {
        const service = await Service.findByIdAndDelete(id)
        if (!service) return fail(res, 400, null, "Service doesn't exist")
        return success(res, 200, null, "Service deleted successful")
    } catch (error) {
        return sendError(res, 500, null, error.message)
    }
}

const updateService = async (req, res) => {
    try {
        var id = req.params.id;
        const updatedService = await Service.findByIdAndUpdate({ _id: id }, req.body, {
            new: true,
        })
        if (updatedService) {
            message = `Service updated successful`;
            success(res, 200, updatedService, message);
            return;
        }

        else {
            message = `We don't have Service with this id: ${id}`;
            fail(res, 404, null, message);
            return;
        }
    }
    catch (error) {
        return sendError(res, 500, null, error.message)
    }
}

module.exports = { createService, getServices, getService, deleteService, updateService }