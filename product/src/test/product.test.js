const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();

chai.use(chaiHttp);


describe("Products", () => {
  // let app;
  let authToken;
  let listProduct;

  // before chạy trc
  before(async () => {

    const authRes = await chai
      .request("http://uyen_api_gateway:3003")
      .post("/auth/api/v1/login")
      .send({ username: "testuser", password: "123456" });
    // console.log(authRes.body, '  my token');
    authToken = authRes.body?.token || '';

    // thêm trước 1 product
    await chai
      .request('http://uyen_api_gateway:3003')
      .post("/products/api/v1/add")
      .set("authorization", `Bearer ${authToken}`)
      .send({
        name: "Product 8989",
        price: 100000,
        description: "Description of Product 8989",
        quantity: 100
      });

    await chai
      .request('http://uyen_api_gateway:3003')
      .post("/products/api/v1/add")
      .set("authorization", `Bearer ${authToken}`)
      .send({
        name: "Product 9898",
        price: 100000,
        description: "Description of Product 9898",
        quantity: 100
      });

    // lay cac product co san de test !!!
    listProduct = await chai
      .request('http://uyen_api_gateway:3003')
      .get("/products/api/v1")
      .set("authorization", `Bearer ${authToken}`)
  });

  after(async () => {
    console.log('complete !!!!')
  });

  // sẽ chạy sau khi before chạy xong
  describe("POST /products", () => {
    it("should create a new product", async () => {
      const product = {
        name: "Product 1",
        description: "Description of Product 1",
        price: 10,
        quantity: 100
      };

      // khúc này là gửi request như postman
      const res = await chai
        .request('http://uyen_api_gateway:3003')
        .post("/products/api/v1/add")
        .set("authorization", `Bearer ${authToken}`)
        .send({
          name: "Product 1",
          price: 10,
          description: "Description of Product 1",
          quantity: 100
        });

      // khúc này là thực hiện việc kiểm tra
      expect(res).to.have.status(201);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("name", product.name);
      expect(res.body).to.have.property("description", product.description);
      expect(res.body).to.have.property("price", product.price);
      expect(res.body).to.have.property("quantity", product.quantity);
    });

    it("should return an error if name is missing", async () => {
      // data giả
      const product = {
        description: "Description of Product 1",
        price: 10.99,
      };
      // gửi dữ liệu 
      const res = await chai
        .request('http://uyen_api_gateway:3003')
        .post("/products/api/v1/add")
        .set("authorization", `Bearer ${authToken}`)
        .send(product);
      // test
      expect(res).to.have.status(400);
    });

  });

  // done
  describe("GET /products", () => {
    it("get all product", async () => {

      const res = await chai
        .request('http://uyen_api_gateway:3003')
        .get("/products/api/v1")
        .set("authorization", `Bearer ${authToken}`)


      expect(res).to.have.status(200);

      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);

      const firstProduct = res.body[0];
      expect(firstProduct).to.have.property("_id");
      expect(firstProduct).to.have.property("name").that.is.a("string");
      expect(firstProduct).to.have.property("description").that.is.a("string");
      expect(firstProduct).to.have.property("price").that.is.a("number");
      expect(firstProduct).to.have.property("quantity").that.is.a("number");
    });
  })

  // done
  describe("POST /order", () => {
    it("save orders success", async () => {

      console.log(listProduct.body)

      const res = await chai
        .request('http://uyen_api_gateway:3003')
        .post("/products/api/v1/buy")
        .set("authorization", `Bearer ${authToken}`)
        .send(
          {
            "ids": [
              { "id": listProduct.body[0]._id, "quantity": 12 },
              { "id": listProduct.body[1]._id, "quantity": 28 }
            ]
          }
        )


      expect(res).to.have.status(200);
      expect(res.body).to.have.property("message", 'Đã cập nhật đơn hàng thành công !!');
    });
  })
});

