import mongoose from "mongoose";
import Form from "../models/Form.js";

class OptionController {
    async store(req, res){
        try{
            if(!req.params.id){throw {code : 400, message : "REQUIRED_FORM_ID"}}
            if(!req.params.questionId){throw {code : 400, message : "REQUIRED_QUESTION_ID"}}
            if(!mongoose.Types.ObjectId.isValid(req.params.id)){throw {code : 400, message : "INVALID_ID"}}
            if(!mongoose.Types.ObjectId.isValid(req.params.questionId)){throw {code : 400, message : "INVALID_QUESTION_ID"}}
            if(!req.body.value){throw{ code : 400, message : "VALUE_REQUIRED"}}

            let option = {
                id : new mongoose.Types.ObjectId(),
                value : req.body.value
            }

            const form = await Form.findOneAndUpdate({ _id : req.params.id, userId : req.jwt.id.id},
                                                    {$push : {"questions.$[indexQuestion].options" : option}},
                                                    {
                                                        arrayFilters: [{'indexQuestion.id' : new mongoose.Types.ObjectId(req.params.questionId)}],
                                                        new : true
                                                    })

            if(!form){ throw {code : 400, message : "ADD_OPTION_FAILED"}}

            return res.status(200)
                                .json({
                                    status : true,
                                    message : "ADD_OPTION_SUCCESS",
                                    option
                                })



        }catch(error){
            return res.status(error.code || 500)
                .json(
                    {
                        status : false,
                        message : error.message
                    }
                )

        }
    }

    async update(req, res) {
        try {
            if(!req.params.id) { throw { code: 428, message: "FORM_ID_REQUIRED" } }
            if(!req.params.questionId) { throw { code: 428, message: "QUESTION_ID_REQUIRED" } }
            if(!req.params.optionId) { throw { code: 428, message: "OPTION_ID_REQUIRED" } }
            if(!mongoose.Types.ObjectId.isValid(req.params.id)) { throw { code: 400, message: "INVALID_ID" } }
            if(!mongoose.Types.ObjectId.isValid(req.params.questionId)) { throw { code: 428, message: "INVALID_QUESTION_ID" } }
            if(!mongoose.Types.ObjectId.isValid(req.params.optionId)) { throw { code: 400, message: "OPTION_ID_REQUIRED" } }
            if(!req.body.value){throw {code : 400, message: "REQUIRED VALUE"}}

            //update form
            const question = await Form.findOneAndUpdate(
                                        {  _id: req.params.id, userId: req.jwt.id.id }, 
                                        { $set : { "questions.$[indexQuestion].options.$[indexOption].value": req.body.value} },
                                        { 
                                            arrayFilters: [
                                                { 'indexQuestion.id': new mongoose.Types.ObjectId(req.params.questionId) },
                                                { 'indexOption.id': new mongoose.Types.ObjectId(req.params.optionId) }
                                            ],
                                            new: true   
                                        })
            if(!question) { throw { code: 500, message: "UPDATE_OPTIONS_FAILED" } }

            res.status(200).json({
                    status: true,
                    message: 'UPDATE_OPTIONS_SUCCESS',
                    option: {
                        id: req.params.optionId,
                        value: req.body.value
                    }
                })
        } catch (err) {
            res.status(err.code || 500)
                .json({
                    status: false,
                    message: err.message,
                })
        }
    }
}

export default new OptionController()