const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const jwt = require("jsonwebtoken");
const jwtExpress = require("express-jwt");
const promisify = require("promisify-any");

const signAsync = promisify(jwt.sign, 3);

require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.static("public"));

// app.use(
//   cors({
//     origin: "*",
//   })
// );

app.use(express.text());
app.use(express.json());

app.get("/auth", async (req, res) => {
  const sigHex = req.query.sig;
  const authorizationTarget = req.query.authorizationTarget;
  const chainBotContractAddress = authorizationTarget.split("_")[0];
  const chainBotTokenId = authorizationTarget.split("_")[1];
  const chainBotName = authorizationTarget.split("_")[2];
  const ethSigUtil = require("eth-sig-util");

  msgBufferHex = Buffer.from(authorizationTarget, "utf8");

  const msgParams = {
    data: msgBufferHex,
    sig: Buffer.from(sigHex.replace("0x", ""), "hex"),
  };

  var decodedWalletAddress = ethSigUtil.recoverPersonalSignature(msgParams);

  const oAuth2Token = {
    jti: uuidv4().replace(/\-/g, ""), // used as the sessionId
    iss: process.env.ISSUER,
    aud: process.env.AUDIENCE,
    sub: decodedWalletAddress,
    typ: "Bearer",
    contract_address: chainBotContractAddress,
    token_id: chainBotTokenId,
    bot_name: chainBotName
  };

  let accessTokenRet = await signAsync(oAuth2Token, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ accessToken: accessTokenRet });
});

app.post(
  "/chat",
  jwtExpress({
    secret: process.env.JWT_SECRET,
    audience: process.env.AUDIENCE,
    issuer: process.env.ISSUER,
    algorithms: ["HS256"],
  }),
  (req, res) => {
    console.log(req.user);

    const botKey = process.env["TOKEN" + req.user.token_id + "BOTKEY"];
    const botTalkUrl = process.env.BOT_TALK_URL;
    const sessionId = req.user.jti;

    axios
      .post(botTalkUrl, null, {
        headers: {
          accept: 'application/json'
        },
        params: {
          botkey: botKey,
          sessionid: sessionId,
          client_name: 'chainbot',
          input: req.body,
        },
      })
      .then((response) => {
        if (response.status === 200 && response.data.status === "ok") {
          return res.json(response.data);
        } else {
          console.warn(JSON.stringify(response));
          return res.json(response.data);
        }
      })
      .catch((err) => {
        console.warn(err);
        res.json({
            "status": "error",
            "message": err.message,
            "stack": err.stack,
        });
      });
  }
);

app.listen(port, () => {
  console.log(`Chainbot listening at http://localhost:${port}`);
});
