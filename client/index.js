// membuat variable global untuk menampung account address
let accountAddress = null;
const addressPlaceholder = document.querySelector("#account-address");
addressPlaceholder.innerHTML = "loading...";

window.addEventListener("load", async () => {
  // Modern dapp browsers...
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      // Acccounts now exposed
      console.log("web3 eth");
      const accounts = await web3.eth.getAccounts();
      console.log(accounts[0]);
      addressPlaceholder.innerHTML = accounts[0];

      // memunculkan form donasi setelah account address didapatkan
      accountAddress = accounts[0];
      document.querySelector("#donate-form").style.display = "flex";

      // menghubungkan front-end app ke contract yang telah di deploy
      // dengan membuat local-copy dari contract ke JavaScript
      // contractAddress sesuai dengan yang telah kita deploy. Ubah sesuai contract addressmu!
      const contractAddress = "0x9a0Ee3259A2BFc55dEb2f4813b8CEB02C2137DF6";
      // kita bisa mendapatkan interface di bawah ini dari ABI yang telah kita compile
      const abiInterface = [
        {
          constant: true,
          inputs: [],
          name: "getDonationBalance",
          outputs: [{ name: "", type: "uint256" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "lastDonatedAmount",
          outputs: [{ name: "", type: "uint256" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "lastDonatorAddress",
          outputs: [{ name: "", type: "address" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: true,
          inputs: [],
          name: "contractOwner",
          outputs: [{ name: "", type: "address" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
        {
          constant: false,
          inputs: [],
          name: "donate",
          outputs: [],
          payable: true,
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [],
          payable: false,
          stateMutability: "nonpayable",
          type: "constructor",
        },
      ];
      const donationBoxContract = new web3.eth.Contract(
        abiInterface,
        contractAddress
      );

      // seleksi dom #donation-balance dan isi sementara nilainya dengan teks node "loading..."
      const balancePlaceholder = document.querySelector("#donation-balance");
      balancePlaceholder.innerHTML = "loading...";
      // mencoba memanggil salah satu method yang ada di contract
      donationBoxContract.methods
        .getDonationBalance()
        .call()
        .then(async (res) => {
          // format satuan dari wei ke ether
          const belanceEth = web3.utils.fromWei(res, "ether");
          
          async function getExchangeRate() {
            const response = await axios.get(
              "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=idr"
              );
              return response.data.ethereum.idr;
            }
            
            const exchangeRate = await getExchangeRate();

            console.log(belanceEth);
            console.log(exchangeRate);
            

            const valueInIDR = belanceEth * exchangeRate;

            const formattedValue = valueInIDR.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            });
            balancePlaceholder.innerHTML = belanceEth + " Etherium "+" ( " + formattedValue +")";
        });

      // seleksi dom input dan button
      const donateValueInput = document.querySelector("#donate-value");
      const donateBtn = document.querySelector("#donate-btn");

      // menambahkan listener click pada button donate
      donateBtn.addEventListener("click", () => {
        // mengambil value jumlah ether yang akan didonasikan dalam string
        const donateValue = donateValueInput.value;
        // menjalankan method donate dengan mengirimkan sejumlah ether
        // kita harus format satuan dari ether ke wei

        // console.log(web3.utils.toWei(donateValue, "ether"));
        donationBoxContract.methods.donate().send({
          value: web3.utils.toWei(donateValue, "ether"),
          from: web3.utils.toChecksumAddress(accountAddress),
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
});