const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/test", { useNewUrlParser: true });
