// {
// 	"WHERE": {
// 		"AND": [
// 			{
// 				"IS": {
// 					"courses_id": "310"
// 				}
// 			},
// 			{
// 				"IS": {
// 					"courses_dept": "cpsc"
// 				}
// 			},
// 			{
// 				"EQ": {
// 					"courses_year": 2014
// 				}
// 			}
// 		]
// 	},
// 	"OPTIONS": {
// 		"COLUMNS": [
// 			"courses_dept",
// 			"courses_id",
// 			"courses_avg",
// 			"courses_instructor",
// 			"courses_title",
// 			"courses_pass",
// 			"courses_fail",
// 			"courses_audit",
// 			"courses_year"
// 		],
// 		"ORDER": "courses_avg"
// 	}
// }
//{
//	"WHERE": {
//		"AND": [
//			{
//				"IS": {
//					"rooms_shortname": "DMP"
//				}
//			},
//			{
//				"IS": {
//					"rooms_number": "310"
//				}
//			}
//		]
//	},
//	"OPTIONS": {
//		"COLUMNS": [
//			"rooms_fullname",
//			"rooms_shortname",
//			"rooms_number",
//			"rooms_name",
//			"rooms_address",
//			"rooms_lat",
//			"rooms_lon",
//			"rooms_seats",
//			"rooms_type",
//			"rooms_furniture",
//			"rooms_href"
//		]
//	}
//}

export const coursesQuery = "{\n\t\"WHERE\": {\n\t\t\"AND\": [\n\t\t\t{\n\t\t\t\t\"IS\": {\n\t\t\t\t\t\"courses_id\": \"310\"\n\t\t\t\t}\n\t\t\t},\n\t\t\t{\n\t\t\t\t\"IS\": {\n\t\t\t\t\t\"courses_dept\": \"cpsc\"\n\t\t\t\t}\n\t\t\t},\n\t\t\t{\n\t\t\t\t\"EQ\": {\n\t\t\t\t\t\"courses_year\": 2014\n\t\t\t\t}\n\t\t\t}\n\t\t]\n\t},\n\t\"OPTIONS\": {\n\t\t\"COLUMNS\": [\n\t\t\t\"courses_dept\",\n\t\t\t\"courses_id\",\n\t\t\t\"courses_avg\",\n\t\t\t\"courses_instructor\",\n\t\t\t\"courses_title\",\n\t\t\t\"courses_pass\",\n\t\t\t\"courses_fail\",\n\t\t\t\"courses_audit\",\n\t\t\t\"courses_year\"\n\t\t],\n\t\t\"ORDER\": \"courses_avg\"\n\t}\n}\n"
export const roomsQuery = "{\n\t\"WHERE\": {\n\t\t\"AND\": [\n\t\t\t{\n\t\t\t\t\"IS\": {\n\t\t\t\t\t\"rooms_shortname\": \"DMP\"\n\t\t\t\t}\n\t\t\t},\n\t\t\t{\n\t\t\t\t\"IS\": {\n\t\t\t\t\t\"rooms_number\": \"310\"\n\t\t\t\t}\n\t\t\t}\n\t\t]\n\t},\n\t\"OPTIONS\": {\n\t\t\"COLUMNS\": [\n\t\t\t\"rooms_fullname\",\n\t\t\t\"rooms_shortname\",\n\t\t\t\"rooms_number\",\n\t\t\t\"rooms_name\",\n\t\t\t\"rooms_address\",\n\t\t\t\"rooms_lat\",\n\t\t\t\"rooms_lon\",\n\t\t\t\"rooms_seats\",\n\t\t\t\"rooms_type\",\n\t\t\t\"rooms_furniture\",\n\t\t\t\"rooms_href\"\n\t\t]\n\t}\n}\n"
