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

const employeeController = {
  createEmployee,
};
module.exports = employeeController;
