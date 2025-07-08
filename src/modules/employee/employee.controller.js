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
    res.status(500).json({ status: false, code: 500, message: error.message });
  }
};

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
    res.status(500).json({ status: false, code: 500, message: error.message });
  }
};

const getEmployeeProfile = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const result = await employeeService.getEmployeeProfile(employeeId);

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Employee profile fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ status: false, code: 500, message: error.message });
  }
};

const updateEmployeeProfile = async (req, res) => {
  try {
    console.log(req.user);
    const { employeeId } = req.user;
    const result = await employeeService.updateEmployeeOwnProfile(
      employeeId,
      req.body,
      req.file
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Employee profile updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ status: false, code: 500, message: error.message });
  }
};

const employeeController = {
  createEmployee,
  getMyEmployees,
  employeeCoinGive,
  getEmployeeProfile,
  updateEmployeeProfile,
};
module.exports = employeeController;
