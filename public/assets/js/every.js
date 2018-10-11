var page = window.location.pathname
var balance = 0
var curprice = 0
var yesterday = 0
var disabledarray = [4, 5, 7, 8, 16, 17, 18, 19, 20]
var country_list = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua &amp; Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia &amp; Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia", "Cruise Ship", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyz Republic", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre &amp; Miquelon", "Samoa", "San Marino", "Satellite", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "St Kitts &amp; Nevis", "St Lucia", "St Vincent", "St. Lucia", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad &amp; Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks &amp; Caicos", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen", "Zambia", "Zimbabwe"];
$.ajax({
    type: "GET",
    url: '/api/profile',
    success: function (result) {
        if ($('#account-name')[0]) {
            $('#account-name')[0].innerText = result.fname + " " + result.lname
            for (i = 0; i < result.assets.length; i++) {
                var asset = result.assets[i]
                if (!disabledarray.includes(i)) {
                    $('#sidebar-asset')[0].innerHTML += '<li><a href="/assets/' + i + '">' + asset.asset_name + '</a></li>'
                }
            }
        }
    }
});
if (page == "/wallet") {
    $('#register-form').hide();
    $('#login-form').hide();
    $("#click-register").on("click", function () {
        $('#bg-vid').attr('class','video-background');
        $('#login-form').hide(500)
        $('#register-form').show(1000)
    });
    $("#click-login").on("click", function () {
        $('#bg-vid').attr('class','video-background');
        $('#register-form').hide(500)
        $('#login-form').show(1000)
    });
    $('#login').submit(function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        var body = $('#login').serializeJSON()
        console.log(body)
        $.ajax({
            type: "POST",
            url: '/login',
            data: body,
            success: function (data) {
                if (data.success) {
                    notify('success', data.message)
                    window.setTimeout(function () {
                        window.location = "/dashboard";
                    }, 2000);
                } else {
                    notify('danger', data.message)
                }
            }
        });
        return false;
    });
    $('#register').submit(function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        var body = $('#register').serializeJSON()
        body.country = country_list[parseInt(body.country)]
        console.log(body)
        $.ajax({
            type: "POST",
            url: '/register',
            data: body,
            success: function (data) {
                if (data.success) {
                    notify('success', data.message)
                    $("#click-login").click()
                } else {
                    notify('danger', data.message)
                }
            }
        });
        return false;
    });
    $("#bday").datepicker({
        dateFormat: 'mm/dd/yy',
        changeMonth: true,
        changeYear: true,
        yearRange: '-100y:c+nn',
        maxDate: '-1d'
    });
    $.each(country_list, function (key, value) {
        $('#country')
            .append($("<option></option>")
                .attr("value", key)
                .text(value));
    });
}
if (page == "/settings") {
    $("#bday").datepicker({
        dateFormat: 'mm/dd/yy',
        changeMonth: true,
        changeYear: true,
        yearRange: '-100y:c+nn',
        maxDate: '-1d'
    });
    $.each(country_list, function (key, value) {
        $('#country')
            .append($("<option></option>")
                .attr("value", key)
                .text(value));
    });
    $.ajax({
        type: "GET",
        url: '/api/settings',
        success: function (data) {
            $('#fname')[0].value = data.fname
            $('#lname')[0].value = data.lname
            $('#email')[0].value = data.email
            $('#emergency')[0].value = data.emergency
            $('#bday')[0].value = data.birthdate
            $('#country').val(country_list.indexOf(data.country))
            $('#qrimage')[0].src = '/qr/secret/' + data.twofa.secret
            //data.twofa.enabled ? $("#qrcde").show() : $("#qrcde").hide()
            $('#smartwizard').smartWizard({
                toolbarSettings: {
                    toolbarPosition: "bottom",
                    toolbarButtonPosition: "right",
                    showNextButton: false, // show/hide a Next button
                    showPreviousButton: false, // show/hide a Previous button
                }
            });
            if (data.twofa.enabled) {
                $('#enable-2fa')[0].innerText = "Disable 2FA"
                $('#modal-2fa')[0].href = "#modal_disable"
            } else {
                $('#enable-2fa')[0].innerText = "Enable 2FA"
                $('#modal-2fa')[0].href = "#modal_enable"
            }
        }
    });
    $('#setting').submit(function (ev) {
        var body = $('#setting').serializeJSON()
        body.country = country_list[parseInt(body.country)]
        $.ajax({
            type: "POST",
            url: '/settings',
            data: body,
            success: function (data) {
                if (data.success) {
                    notify('success', data.message)
                    window.setTimeout(function () {
                        location.reload();
                    }, 1000);

                } else {
                    notify('danger', data.message)
                }
            }
        });
        ev.preventDefault()
    });
    $('#password').submit(function (ev) {
        var body = $('#password').serializeJSON()
        $.ajax({
            type: "POST",
            url: '/settings/password',
            data: body,
            success: function (data) {
                if (data.success) {
                    notify('success', data.message)
                    window.setTimeout(function () {
                        location.reload();
                    }, 1000);
                } else {
                    notify('danger', data.message)
                }
            }
        });
        ev.preventDefault()
    });
    $('#twofauth').submit(function (ev) {
        var body = $('#twofauth').serializeJSON()
        $.ajax({
            type: "POST",
            url: '/settings/twofa',
            data: body,
            success: function (data) {
                if (data.success) {
                    notify('success', data.message)
                    window.setTimeout(function () {
                        location.reload();
                    }, 1000);
                } else {
                    notify('danger', data.message)
                }
            }
        });
        ev.preventDefault()
    });
    $('#disable-2fa').submit(function (ev) {
        var body = $('#disable-2fa').serializeJSON()
        $.ajax({
            type: "POST",
            url: '/settings/twofa/disable',
            data: body,
            success: function (data) {
                if (data.success) {
                    notify('success', data.message)
                    window.setTimeout(function () {
                        location.reload();
                    }, 1000);
                } else {
                    notify('danger', data.message)
                }
            }
        });
        ev.preventDefault()
    });
    $("#twofasubmit").on("click", function () {
        $('#twofauth').submit()
    });
    $("#disablesubmit").on("click", function () {
        $('#disable-2fa').submit()
    });
    $("#prev-btn").on("click", function () {
        $('#smartwizard').smartWizard("prev");
        return true;
    });
    $("#next-btn").on("click", function () {
        $('#smartwizard').smartWizard("next");
        return true;
    });
    $('#two-fa').click(function () {
        if ($('#two-fa').prop('checked')) {
            $("#qrcde").show()
        } else {
            $("#qrcde").hide()
        }
    })
}


if (page.includes("/assets/")) {
    var id = parseInt(page.replace("/assets/", ""))
    $('button').tooltip({
        trigger: 'click',
        placement: 'bottom'
    });

    function setTooltip(btn, message) {
        $(btn).tooltip('hide')
            .attr('data-original-title', message)
            .tooltip('show');
    }

    function hideTooltip(btn) {
        setTimeout(function () {
            $(btn).tooltip('hide');
        }, 1000);
    }
    var clip = new ClipboardJS('.btn')
    clip.on('success', function (e) {
        setTooltip(e.trigger, 'Copied!');
        hideTooltip(e.trigger);
    })
    $.ajax({
        type: "GET",
        url: '/api/assets/' + id,
        success: function (result) {
            if (result.info.balance.countDecimals() > 8) {
                $('#asset-bal1')[0].innerText = result.info.balance.toFixed(8) + " " + result.info.asset_symbol
                $('#asset-bal2')[0].innerText = result.info.balance.toFixed(8) + " " + result.info.asset_symbol
            } else {
                $('#asset-bal1')[0].innerText = result.info.balance + " " + result.info.asset_symbol
                $('#asset-bal2')[0].innerText = result.info.balance + " " + result.info.asset_symbol
            }
            if (id == 0 || id == 9) {
                if ((result.price.value * result.info.balance).countDecimals() > 2) {
                    $('#asset-val')[0].innerText = (result.price.value * result.info.balance).toFixed(2) + " USD"
                } else {
                    $('#asset-val')[0].innerText = (result.price.value * result.info.balance) + " USD"
                }
            } else {
                if ((result.price.value * result.info.balance).countDecimals() > 2) {
                    $('#asset-val')[0].innerText = (result.btcprice * result.price.value * result.info.balance).toFixed(2) + " USD"
                } else {
                    $('#asset-val')[0].innerText = (result.btcprice * result.price.value * result.info.balance) + " USD"
                }
            }
            $('#asset-name1')[0].innerText = result.info.asset_name
            $('#asset-name2')[0].innerText = result.info.asset_name
            $('#asset-sym')[0].innerText = result.info.asset_symbol
            $('#chart-head')[0].innerText = result.info.asset_name + " Price (1 Month)"
            $('#deposit_address1')[0].innerText = result.deposit.address
            $('#deposit_address2')[0].innerText = result.deposit.address
            $('#qr-code').attr("src", '/qr/' + result.deposit.address);
            result.trans.forEach(function (transaction) {
                var transdata = '<tr> <td> <div class="user_box"> <div class="user_email"> <span>' + result.info.asset_name + '</span> <span class="f-s-11"> ' + result.info.asset_symbol + ' </span> </div> </div> </td> <td> ' + transaction.value + ' </td> <td> <a target="_blank"  href="https://www.blockchain.com/btc/tx/' + transaction.txid + '">' + transaction.txid + '</a> </td> <td> ' + new Date(transaction.timestamp * 1000).toString() + ' </td> <td> ' + (transaction.value * result.btcprice).toFixed(2) + ' USD </td> <td> ' + transaction.fee + " " + result.info.asset_symbol + ' </td> <td> ' + transaction.type + ' </td> <td> <span class="text-success">Completed</span> </td> </tr>'
                $("#transaction tbody").append(transdata);
            })
        }
    });
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    TradingView.onready(function()
    {
        var widget = window.tvWidget = new TradingView.widget({
            // debug: true, // uncomment this line to see Library errors and warnings in the console
            symbol: 'AAPL',
            interval: 'D',
            container_id: "tv_chart_container",

            //	BEWARE: no trailing slash is expected in feed URL
            datafeed: new Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
            library_path: "../charting_library/",
            locale: getParameterByName('lang') || "en",
            width: "100%",
            disabled_features: ["use_localstorage_for_settings"],
            enabled_features: ["study_templates"],
            charts_storage_url: 'http://saveload.tradingview.com',
            charts_storage_api_version: "1.1",
            client_id: 'tradingview.com',
            user_id: 'public_user_id',
            theme: getParameterByName('theme'),
        });
    });
}

if (page == "/dashboard") {
    $.ajax({
        type: "GET",
        url: '/api/dashboard',
        success: function (result) {
            var btcprice = 0;
            var assetvalue = 0
            var assetsu = $(".asset-details");
            var links = $(".asset-link");
            var LineChart = $(".chartjs");
            var growth = []
            var yesterdayval = 0
            var bestcoin = {
                id: 0,
                profit: 0
            }
            for (i = 0; i < assetsu.length; i++) {
                var chartdata = findObjectByKey(result.chart, "cid", i)
                var yeardata = findObjectByKey(chartdata, "year", new Date().getUTCFullYear())
                var monthdata = findObjectByKey(yeardata, "month", new Date().getUTCMonth())
                var datedata = findObjectByKey(monthdata, "day", new Date().getUTCDate() - 1)
                var hourdata = findObjectByKey(datedata, "hour", new Date().getUTCHours())
                var asset = assetsu[i]
                var assets = result.asset[i]
                var profit = ((datedata[datedata.length - 1].data.value - datedata[0].data.value) * assets.balance)
                yesterdayval += datedata[0].data.value * assets.balance
                growth[i] = ((datedata[datedata.length - 1].data.value - datedata[0].data.value) / datedata[0].data.value) * 100
                $(".asset-logo")[i].src = "/images/logo/" + i + ".png"
                asset.children[0].innerText = assets.asset_name
                chartmaker(LineChart[i], i, chartdata)
                if (!disabledarray.includes(i)) {
                    links[i].href = "/assets/" + i
                } else {
                    links[i].href = "#"
                }
                if (assets.balance.countDecimals() > 8) {
                    asset.children[1].innerText = assets.balance.toFixed(8) + " " + assets.asset_symbol
                } else {
                    asset.children[1].innerText = assets.balance + " " + assets.asset_symbol
                }
                if (i == 0) {
                    btcprice = hourdata[0].data.value
                    asset.children[2].innerText = (assets.balance * btcprice).toFixed(2).toString() + " USD"
                    assetvalue += assets.balance * btcprice
                } else {
                    asset.children[2].innerText = (assets.balance * hourdata[0].data.value * btcprice).toFixed(2).toString() + " USD"
                    assetvalue += assets.balance * hourdata[0].data.value * btcprice
                }
                if (growth[i] < 0) {
                    asset.children[4].innerHTML = '<span class="text-danger">' + profit.toFixed(2) + " USD, " + growth[i].toFixed(4) + " %" + '</span>'
                } else {
                    asset.children[4].innerHTML = '<span class="text-success">' + profit.toFixed(2) + " USD, " + growth[i].toFixed(4) + " %" + '</span>'
                }

                if (growth[i] > bestcoin.profit) {
                    bestcoin = {
                        id: i,
                        profit: growth[i]
                    }
                }
            }
            if (yesterdayval == 0) {
                $('#24h-per')[0].innerText = "0%"
            } else {
                $('#24h-per')[0].innerText = (assetvalue - yesterdayval) / yesterdayval * 100 + " %"
            }
            $('#profit-coin')[0].innerText = result.asset[bestcoin.id].asset_name
            $('#asset-value')[0].innerText = assetvalue.toFixed(2) + " USD"
            $('#24h-usd')[0].innerText = (assetvalue - yesterdayval) + " USD"
        }
    });
}

function notify(type, message) {
    "use strict";
    $.notify({
        icon: "icon-bell icons",
        message: message
    }, {
        type: type,
        timer: 8000,
        placement: {
            from: 'top',
            align: 'right'
        }
    });
}

function chartmaker(chart, tet, data) {
    var i;
    a = chart.getContext('2d');
    (i = a.createLinearGradient(0, 0, 0, 150)).addColorStop(0, 'rgba(147,104,233,1)'), i.addColorStop(1, "rgba(255,255,255,0)");
    var charter = []
    for (var tet = 0; tet < 24; tet++) {
        if (data[tet]) {
            charter.push(data[tet].data.value)
        }
    }
    new Chart(a, {
        type: "line",
        options: {
            responsive: !0,
            maintainAspectRatio: !1,
            datasetStrokeWidth: 3,
            pointDotStrokeWidth: 4,
            tooltipFillColor: "rgba(255, 145, 73,0.8)",
            legend: {
                display: !1
            },
            scales: {
                xAxes: [{
                    display: !1
                }],
                yAxes: [{
                    display: !1,
                }]
            }
        },
        data: {
            labels: ["0:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
            datasets: [{
                label: "BTC",
                data: charter,
                backgroundColor: i,
                borderColor: "#8f1cad",
                borderWidth: 1.5,
                strokeColor: "#8f1cad",
                pointRadius: 0
            }]
        }
    });
}

function findObjectByKey(array, key, value) {
    var returnarr = []
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            returnarr.push(array[i])
        }
    }
    return returnarr;
}
Number.prototype.countDecimals = function () {
    if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0;
}