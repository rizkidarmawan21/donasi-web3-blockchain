const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
require("dotenv").config();
// ABI memiliki dua object penting yang kita butuhkan, yaitu interface dan bytecode
const { interface, bytecode } = require("./compile");

// membuat provider menggunakan mnemonic dan infura url yang kita punya
const mnemonic = process.env.RINKEBY_MNEMONIC
const url = process.env.RINKEBY_INFURA_URL
const provider = new HDWalletProvider(
    mnemonic, url
);

// membuat instance web3
const web3 = new Web3(provider);

const deploy = async () => {
  try {
    // mendapatkan semua account yang kita miliki dalam bentuk array
    const accounts = await web3.eth.getAccounts();
    // // mendeploy contract menggunakan bytecode dan account pertama kita
    const result = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({ data: "0x" + bytecode })
      .send({ from: accounts[2]});

    // tampilkan di log address dari contract yang telah kita deploy
    console.log("Contract deployed to", result.options.address);
    // console.log("Contract deployed to", accounts[1]);
    return;
  } catch (err) {
    console.log({"error ":err});
    return;
  }
};

deploy();
