ndl = {};
ndl.LoginPage = new function () {
    
	var _initialized = false;

    this.init = function (scope) {
        
        var _scope = scope;
        if (_initialized) return;
        _initialized = true;

        $('body').on('click', '#register-button', function(){window.location.href = "/#/register";});
        
    };
};
    