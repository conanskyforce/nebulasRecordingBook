
var dappAddress = 'n1pozpL7VK55pMRkmCuRcELQhmrECJutVoL';

var nebulas = require('nebulas'),
	Account = Account,
	neb = new nebulas.Neb(),
	mainnet = "https://mainnet.nebulas.io",
	testnet = "https://testnet.nebulas.io";
whichNet = testnet;
neb.setRequest(new nebulas.HttpRequest(whichNet));

var NebPay = require('nebpay');
var nebPay = new NebPay();

var sNumber;
var intervalQuery;

var introHide = localStorage['intro'];
if(introHide){
	// $(".intro").hide();
}
$(".intro p span").click(function(){
	//hide info
	$(".intro").hide(300);
	localStorage['intro']=1;
})
// $(".res-of-search").hide();
// $('input').focus();
document.body.onkeyup=function(e){
	if(e.keyCode===13){
		$(".search").click();
	}
}
$(".search").click(function(){
	if(!$(".search-title").val()){
		$(".tips").text('请输入标题!');
		$(".tips")[0].style.display='block';
		// $("..search-title").click(function(){
		// 	$(".tips")[0].style.display='none';
		// })
		setTimeout(function(){
			$(".tips")[0].style.display='none';
		},1500);
		return;
	}
	$(".input-group button").text('查询中...');
	$(".input-group button").attr('disabled',true);
	var from = dappAddress;
	var value = '0';
	var nonce = '0';
	var gas_price = '1000000';
	var gas_limit = '2000000';
	var callFunc = "getRecord";
	var callArgs = '["'+$(".search-title").val()+'"]';

	var contract = {
		function:callFunc,
		args:callArgs
	};
	neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract)
		   .then(function(res){
		   	var result = res.result;
		   	if(result ==='null'){
		   		$(".tips").text('没有查询到相关数据');
				$(".tips")[0].style.display='block';
				$(".input-group button").text('查询点我');
				$(".input-group button").attr('disabled',false);
				setTimeout(function(){
					$(".tips")[0].style.display='none';
				},1500);
		   		return;
		   	}
		   	result = JSON.parse(result);
		   	$(".input-group button").text('查询点我');
			$(".input-group button").attr('disabled',false);
		   	$(".res-of-search").show(500);
		   	$(".tips").addClass('tips-success');
		   	$(".tips").text('查询成功!');
		   	$(".tips")[0].style.display='block';
		   	setTimeout(function(){
		   			$(".tips").removeClass('tips-success');
					$(".tips")[0].style.display='none';
				},1500);
		   	// $(".res-of-search")[0].style.display='flex';
		   	$(".res-of-search span.title").text(result.title);
		   	$(".res-of-search span.author").text(result.author);
		   	$(".res-of-search span.res-content").text(result.content);
		   }).catch(function(err){
		   	$(".input-group button").attr('disabled',false);
		   	console.log("Error:"+err);
		   })
})

$(".record-submit").click(function(){
	if(!$(".record-title").val()||!$(".record-content").val()){
		$(".record-tips").text('标题或内容不能为空！');
		setTimeout(function(){
			$(".record-tips").html('&nbsp;');
		},1500);
		return;
	}
	$(".record-submit").val('提交中...');
	$(".record-submit").attr('disabled',true);
	var to = dappAddress;
	var value = '0';
	var callFunc = 'record';
	var callArgs = "[\""+$(".record-title").val()+"\",\""+$(".record-content").val()+"\"]";
	sNumber = nebPay.call(to,value,callFunc,callArgs,{
		listener:function(res){
			console.log('callback function is：');
			if(JSON.stringify(res).indexOf('Error')!=-1){
				$(".record-submit").val('提交');
				$(".record-submit").attr('disabled',false);	
			}else{
				intervalQuery = setInterval(function() {
		            funcIntervalQuery();
		        }, 15000); 
			}
			console.log(res);
		},
		callback: NebPay.config.testnetUrl
	});
	//建议查询频率10-15s,因为星云链出块时间为15s,并且查询服务器限制每分钟最多查询10次。
	
})
function funcIntervalQuery() {   
        //queryPayInfo的options参数用来指定查询交易的服务器地址,(如果是主网可以忽略,因为默认服务器是在主网查询)
        nebPay.queryPayInfo(sNumber, {
        	callback: NebPay.config.testnetUrl
        })   //search transaction result from server (result upload to server by app)
            .then(function (resp) {
                console.log("tx result: " + resp)   //resp is a JSON string
                var respObject = JSON.parse(resp)
                $(".record-tips").text('记录正在打包！');
                //code==0交易发送成功, status==1交易已被打包上链
                if(respObject.code === 0 && respObject.data.status === 1){                    
                    //交易成功,处理后续任务....
                    $(".record-tips").text('记录已成功！');
                    setTimeout(function(){
                    	$(".record-tips").html('&nbsp;');
                    },1300)
                    $(".record-submit").val('提交');
					$(".record-submit").attr('disabled',false);	
                    clearInterval(intervalQuery)    //清除定时查询
                }
            })
            .catch(function (err) {
                console.log(err);
                $(".record-submit").val('提交');
				$(".record-submit").attr('disabled',false);	
            });
    }


