var express = require("express");

exports.plugin = function(loader) {

	var user = loader.params("auth.user"),
	pass = loader.params("auth.pass");

	return express.basicAuth(function(u, p) {
		return  u == user && p = pass;
	}, 'Restricted area');
}