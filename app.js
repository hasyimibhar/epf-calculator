Vue.component('currency', {
	template: '<input ref="input" class="form-control" v-bind:value="value"\
		v-on:input="updateValue($event.target.value)" style="text-align:right">',
	props: ['value'],
	data: function () {
		return {
			old: 0,
		}
	},
	mounted: function () {
		this.formatValue();
	},
	methods: {
		numberWithCommas: function (x) {
		    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
		formatValue: function () {
			var actual = this.numberWithCommas(Number(this.value).toFixed(2));
			this.$refs.input.value = actual;
			this.old = actual;
    	},
		updateValue: function (value) {
			var cents = Number(value.replace('.','').split(',').join(''));

			var actual = 0;
			if (isNaN(cents)) {
				actual = Number(this.old.replace('.','').split(',').join(''));
			} else {
				actual = cents;
			}

			actual = this.numberWithCommas((actual/100.0).toFixed(2));

			if (actual !== value) {
				this.$refs.input.value = actual;
			}

			this.$emit('input', actual);
			this.old = actual;
		},
	}
})

var app = new Vue({
	el: '#content',
	data: {
		test: 0,
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
			var salary = this.number(this.config.startSalary);
			var balance = this.number(this.config.startBalance);

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
		number: function (value) {
			return Number(value.toString().split(',').join(''));
		},
		currency: function (value) {
			return this.numberWithCommas(Number(value).toFixed(2));
		},
		percentage: function (value) {
			return value.toFixed(2) + '%';
		},
		numberWithCommas: function (x) {
		    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
	},
	watch: {
		"config.avgDividend": function (value) {
			if (value == "") {
				this.config.avgDividend = 5;
			}
		},
		"config.startYear": function (value) {
			if (value == "") {
				this.config.startYear = new Date().getFullYear();
			}
		},
		"config.startAge": function (value) {
			if (value == "") {
				this.config.startAge = 25;
			}
		},
		"config.endAge": function (value) {
			if (value == "") {
				this.config.endAge = 55;
			}
		},
	},
})
