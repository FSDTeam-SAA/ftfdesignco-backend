const employeeService = require("./employee.service");

const createEmployee = async (req, res) => {
  try {
    const { email } = req.user;
    const result = await employeeService.createEmployeeInDb(email, req.body);

    return res.status(201).json({
      status: true,
      code: 201,
      message: "Employee created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ status: false, code: 500, message: error.message });
  }
};

const getMyEmployees = async (req, res) => {
  try {
    const { email } = req.user;
    const result = await employeeService.getMyEmployees(email);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Employees fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ status: false, code: 500, message: error.message });
  }
};

//TODO:1 employee profile updated is not added...........

const employeeCoinGive = async (req, res) => {
  try {
    const { email } = req.user;
    const { employeeId } = req.params;
    const result = await employeeService.employeeCoinGive(
      email,
      req.body,
      employeeId
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Coin given successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error giving coin:", error);
    res.status(500).json({ status: false, code: 500, message: error.message });
  }
};

const employeeController = {
  createEmployee,
  getMyEmployees,
  employeeCoinGive,
};
module.exports = employeeController;
