const express = require('express')
const Portifolio = require("../models/Portifolio");
const { success, fail, sendError } = require('../function/respond')


const createPortifolio = async (req, res) => {
    try {
    const { desc, title, image } = req.body;
    // const result = await cloudinary.uploader.upload(req.file.path);
    const newPortifolio = new Portifolio({
        title,
        desc,
        image
    });
        const portifolioSaved = await newPortifolio.save();
        console.log(portifolioSaved)
        return success(res, 201, portifolioSaved, "Portifolio added successful")
    } catch (error) {
        return sendError(res,500,null,error.message)
    }
}

const getPortifolios = async (req, res) => {
    try {
        const portifolio = await Portifolio.find().sort("-createdAt");
        return success(res, 200, portifolio, "retrieved Portifolio")
    } catch (error) {
        return sendError(res,500,null,error.message)
    }
}

const getPortifolio = async (req, res) => {
    const id = req.params.id;
    try {
        const portifolio = await Portifolio.findById(id)
        if (!id) return fail(res, 400, null, "Wrong Id");
        return success(res, 200, portifolio, "retrieved Portifolio")
    } catch (error) {
        return sendError(res,500,null,error.message)
    }
}

const deletePortifolio = async (req, res) => {
    const id = req.params.id;
    try {
        const portifolio = await Portifolio.findByIdAndDelete(id)
        if (!portifolio) return fail(res, 400, null, "Portifolio doesn't exist")
        return success(res, 200, null, "Portifolio deleted successful")
    } catch (error) {
        return sendError(res,500,null,error.message)
    }
}

const updatePortifolio = async (req, res) => {
    try {
        var id = req.params.id;
        let bodyData = req.body;
        let data = await Portifolio.findOneAndUpdate(
            { _id: id },
            { $set: bodyData });
        const findeUpdaPortifolio = await Portifolio.findOne({ _id: id });
        if (findeUpdaPortifolio) {
            message = `Portifolio updated successful`;
            success(res, 200, findeUpdaPortifolio, message);
            return;
        }
        else {
            message = `We don't have Portifolio with this id: ${id}`;
            fail(res, 404, null, message);
            return;
        }
    }
    catch (error) {
        return sendError(res,500,null,error.message)
    }
}


module.exports = { createPortifolio, getPortifolios, getPortifolio, deletePortifolio, updatePortifolio }