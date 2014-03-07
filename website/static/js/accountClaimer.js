/**
 * Module that enables account claiming on the project page. Makes unclaimed
 * usernames show popovers when clicked, where they can input their email.
 *
 * Sends HTTP requests to the claim_user_post endpoint.
 */
this.OSFAccountClaimer = (function($, global, bootbox) {
    'use strict';

    function AccountClaimer (selector) {
        this.selector = selector;
        this.element = $(selector);
        this.init();
    }

    function getClaimUrl() {
        var uid = $(this).data('pk');
        var pid = global.nodeId;
        return '/api/v1/user/' + uid + '/' + pid +  '/claim/verify/';
    }

    function alertFinished(email) {
        bootbox.alert({
            title: 'Email will arrive shortly',
            message: ['Please check <em>', email, '</em>'].join('')
        });
    }

    AccountClaimer.prototype = {
        constructor: AccountClaimer,
        init: function() {
            var self = this;
            if (global.userId.length) { // If user is logged in, ask for confirmation
                self.element.on('click', function() {
                    var pk = $(this).data('pk');
                    if (pk !== global.userId) {
                        bootbox.confirm({
                            title: 'Claim Account',
                            message: 'If you claim this account, a contributor of this project ' +
                                    'will be emailed to confirm your identity.',
                            callback: function(confirmed) {
                                if (confirmed) {
                                    $.osf.postJSON(getClaimUrl(), {
                                        claimerId: global.userId,
                                        pk: pk
                                    }, function(response) {
                                        alertFinished(response.email);
                                    });
                                }
                            }
                        });
                    }
                });
            } else {
                self.element.editable({
                    type: 'text',
                    value: '',
                    ajaxOptions: {
                        type: 'post',
                        contentType: 'application/json',
                        dataType: 'json'  // Expect JSON response
                    },
                    success: function(data) {
                        alertFinished(data.email);
                    },
                    display: function(value, sourceData){
                        if (sourceData && sourceData.fullname) {
                            $(this).text(sourceData.fullname);
                        }
                    },
                    // Send JSON payload
                    params: function(params) {
                        return JSON.stringify(params);
                    },
                    title: 'Claim Account',
                    placement: 'bottom',
                    placeholder: 'Enter email...',
                    validate: function(value) {
                        var trimmed = $.trim(value);
                        if (!$.osf.isEmail(trimmed)) {
                            return 'Not a valid email.';
                        }
                    },
                    url: getClaimUrl.call(this),
                });
            }
        }
    };

    return AccountClaimer;

})(jQuery, window, bootbox);
