import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

function createData(id, kind, numRows) {
	return { id, kind, numRows };
}
function createCourseData(courses_year,courses_dept,courses_id, courses_avg, courses_instructor,courses_title
,courses_pass,courses_fail,courses_audit) {
	return { courses_year,courses_dept,courses_id, courses_avg, courses_instructor,courses_title
		,courses_pass,courses_fail,courses_audit };
}
function createRoomData(rooms_fullname,rooms_shortname,rooms_number, rooms_name, rooms_address,rooms_lat
	,rooms_lon,rooms_seats,rooms_type,rooms_furniture,rooms_href) {
	return { rooms_fullname,rooms_shortname,rooms_number, rooms_name, rooms_address,rooms_lat
		,rooms_lon,rooms_seats,rooms_type,rooms_furniture,rooms_href };
}

//code modified from https://mui.com/zh/components/tables/
export function DSTable(props) {
	const rows = [];
	props.datasets.map(x => rows.push(createData(x.id,x.kind,x.numRows)));

	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell align="right">Kind</TableCell>
						<TableCell align="right">Number of rows</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row) => (
						<TableRow
							key={row.id}
							sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
						>
							<TableCell component="th" scope="row">
								{row.id}
							</TableCell>
							<TableCell align="right">{row.kind}</TableCell>
							<TableCell align="right">{row.numRows}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

export function QueryTable(props) {
	const rows = [];
	props.result.map(x => rows.push(createCourseData(
		x.courses_year,x.courses_dept,x.courses_id, x.courses_avg, x.courses_instructor,x.courses_title
		,x.courses_pass,x.courses_fail,x.courses_audit)));

	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell align="right">Year</TableCell>
						<TableCell align="right">Dept</TableCell>
						<TableCell align="right">ID</TableCell>
						<TableCell align="right">Avg</TableCell>
						<TableCell align="right">Instructor</TableCell>
						<TableCell align="right">Title</TableCell>
						<TableCell align="right">Pass</TableCell>
						<TableCell align="right">Fail</TableCell>
						<TableCell align="right">Audit</TableCell>

					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row) => (
						<TableRow
							key={row.courses_year}
							sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
						>
							<TableCell component="th" scope="row">
								{row.courses_year}
							</TableCell>
							<TableCell align="right">{row.courses_dept}</TableCell>
							<TableCell align="right">{row.courses_id}</TableCell>
							<TableCell align="right">{row.courses_avg}</TableCell>
							<TableCell align="right">{row.courses_instructor}</TableCell>
							<TableCell align="right">{row.courses_title}</TableCell>
							<TableCell align="right">{row.courses_pass}</TableCell>
							<TableCell align="right">{row.courses_fail}</TableCell>
							<TableCell align="right">{row.courses_audit}</TableCell>

						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
export function RoomQueryTable(props) {
	const rows = [];
	console.log(props.result)
	props.result.map(x => rows.push(createRoomData(x.rooms_fullname,x.rooms_shortname,x.rooms_number, x.rooms_name, x.rooms_address,x.rooms_lat
		,x.rooms_lon,x.rooms_seats,x.rooms_type,x.rooms_furniture,x.rooms_href)));

	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell align="right">Fullname</TableCell>
						<TableCell align="right">Shortname</TableCell>
						<TableCell align="right">Number</TableCell>
						<TableCell align="right">Name</TableCell>
						<TableCell align="right">Address</TableCell>
						<TableCell align="right">Lat</TableCell>
						<TableCell align="right">Lon</TableCell>
						<TableCell align="right">Seats</TableCell>
						<TableCell align="right">Type</TableCell>
						<TableCell align="right">Furniture</TableCell>
						<TableCell align="right">Href</TableCell>

					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row) => (
						<TableRow
							key={row.rooms_fullname}
							sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
						>
							<TableCell component="th" scope="row">
								{row.rooms_fullname}
							</TableCell>
							<TableCell align="right">{row.rooms_shortname}</TableCell>
							<TableCell align="right">{row.rooms_number}</TableCell>
							<TableCell align="right">{row.rooms_name}</TableCell>
							<TableCell align="right">{row.rooms_address}</TableCell>
							<TableCell align="right">{row.rooms_lat}</TableCell>
							<TableCell align="right">{row.rooms_lon}</TableCell>
							<TableCell align="right">{row.rooms_seats}</TableCell>
							<TableCell align="right">{row.rooms_type}</TableCell>
							<TableCell align="right">{row.rooms_furniture}</TableCell>
							<TableCell align="right">{row.rooms_href}</TableCell>

						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
