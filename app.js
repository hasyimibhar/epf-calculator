var app = new Vue({
	el: '#content',
	data: {
		config: {
			startSalary: 2500,
			avgSalaryIncr: 3.0,
			employerContrib: 13.0,
			employeeContrib: 11.0,
			autoEmployerContrib: true,
			avgDividend: 5.0,
			startYear: 2017,
			startAge: 25,
			endAge: 55,
			startBalance: 0.0,
		},
		months: [
			{ name: 'January', days: 31 },
			{ name: 'February', days: 28 },
			{ name: 'March', days: 31 },
			{ name: 'April', days: 30 },
			{ name: 'May', days: 31 },
			{ name: 'June', days: 30 },
			{ name: 'July', days: 31 },
			{ name: 'August', days: 31 },
			{ name: 'September', days: 30 },
			{ name: 'October', days: 31 },
			{ name: 'November', days: 30 },
			{ name: 'December', days: 31 },
		],
		totalDays: 365,
	},
	computed: {
		tabulated: function () {
			var table = [];
			var year = this.config.startYear;
			var salary = this.config.startSalary;
			var balance = this.config.startBalance;

			for (var age = this.config.startAge; age <= this.config.endAge; age++) {
				var record = {
					age: age,
					year: year,
					salary: salary,
					contrib: {
						employer: salary * (this.config.employerContrib/100.0),
						employee: salary * (this.config.employeeContrib/100.0),
					},
					balance: balance,
					rows: [],
					total: {
						days: this.totalDays,
						salary: 0.0,
						contrib: {
							employer: 0.0,
							employee: 0.0,
						},
						dividend: {
							amount: 0.0,
						},
						balance: 0.0,
					}
				};

				if (this.config.autoEmployerContrib) {
					record.contrib.employer = salary * (salary > 5000 ? 0.12 : 0.13);
				}

				for (var i = 0; i < this.months.length; i++) {
					var month = this.months[i];
					var row = {
						month: month.name,
						days: month.days,
						salary: salary,
						contrib: {
							employer: record.contrib.employer,
							employee: record.contrib.employee,
						},
						dividend: {
							rate: this.config.avgDividend,
							amount: 0.0,
						},
						balance: 0.0,
					};

					row.balance = (i == 0 ? record.balance : record.rows[i-1].balance) + row.contrib.employer + row.contrib.employee;

					row.dividend.amount = (((i == 0 ? record.balance : record.rows[i-1].balance) * (row.dividend.rate/100.0))/this.totalDays)*(row.days-1) +
						((row.balance * (row.dividend.rate/100.0))/this.totalDays);

					record.total.salary += row.salary;
					record.total.contrib.employer += row.contrib.employer;
					record.total.contrib.employee += row.contrib.employee;
					record.total.dividend.amount += row.dividend.amount;
					record.total.balance = row.balance;

					record.rows.push(row);
				}

				record.total.balance += record.total.dividend.amount;

				table.push(record);

				year++;
				salary *= 1.0 + (this.config.avgSalaryIncr/100.0);
				balance = record.total.balance;
			}

			return table;
		}
	},
	methods: {
		currency: function (value) {
			return this.numberWithCommas(value.toFixed(2));
		},
		percentage: function (value) {
			return value.toFixed(2) + '%';
		},
		numberWithCommas: function (x) {
		    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
	}
})
