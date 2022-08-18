var coupang = require("express").Router();
const url = require("url");

coupang.get("/crawl", function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  var idpwError = false;
  var dashError = false;
  var calculateExist = false;

  var arr = [idpwError, dashError, calculateExist];

  var queryData = url.parse(req.url, true).query;

  (async () => {
    if (queryData.id && queryData.pw) {
      const coupang_id = queryData.id;
      const coupang_pw = queryData.pw;

      //쿠팡wing 로그인 페이지
      await page.goto("https://wing.coupang.com/login");
      console.log(coupang_id);
      console.log(coupang_pw);

      //아이디랑 비밀번호 란에 값을 넣기
      await page.evaluate(
        (id, pw) => {
          document.querySelector('input[name="username"]').value = id;
          document.querySelector('input[name="password"]').value = pw;
        },
        coupang_id,
        coupang_pw
      );

      //로그인
      await page.click('input[name="login"]');
      console.log("loginClicked");

      //idpw 분기처리
      await page.waitForTimeout(3000);
      idpwError = await page.evaluate(() => {
        //idpw에러 판단
        var check = document.querySelector('span[id="input-error"]') !== null;
        return check; //오류:정상
      });
      console.log("idpwError:" + idpwError);
    }

    if (!idpwError) {
      //idpw분기처리

      dashError = await page.evaluate(async () => {
        //대시보드 에러 판단
        return (
          document.querySelector('button[id="top-header-hamburger"]') !== null
        );
      });

      console.log("dashError:" + dashError);
    }

    if (dashError) {
      //아이디비번이 정상이지만 접속로그때문에 대시보드로 바로 진입할때
      await page.goto(
        "https://wing.coupang.com/tenants/finance/wing/contentsurl/dashboard"
      ); //정산현황페이지로 이동

      await page.waitForTimeout(2000); //로드되는 시간을 기다려준다

      calculateExist = await page.evaluate(async () => {
        //정산현황 여부 판단
        return (
          document.querySelector(
            "#seller-dashboard > div.dashboard-widget > div > strong:nth-child(3) > a"
          ) !== null
        );
      });
    }

    if (calculateExist) {
      await page.waitForTimeout(2000);
      let data = await page.evaluate(async () => {
        const calculation = document.querySelector(
          "#seller-dashboard > div.dashboard-widget > div > strong:nth-child(3) > a"
        );
        const expectedDate = document.querySelector(
          'strong[id="expectedPayDate"]'
        );
        return [calculation.textContent, expectedDate.textContent];
      });
      console.log("ok");
      res.json({ price: data[0], deadline: data[1] });
      return;
    }
    var arr = [idpwError, dashError, calculateExist];
    console.log(arr[0]);
    console.log(arr[1]);
    console.log(arr[2]);

    switch (arr) {
      case arr[0]:
        res.send("101");
        break;
      case arr[1]:
        res.send("102");
        break;
      default:
        await page.waitForSelector('input[name="mfaType"]');
        await page.click('input[name="mfaType"]');
        //인증 버튼 기다리기
        await page.waitForSelector("#auth-mfa-code");
        res.send("auth");
        break;
    }
  })();
});

module.exports = coupang;
