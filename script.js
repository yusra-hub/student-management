
const { createClient } = supabase
const supabaseURL = 'https://iwnjefnyjukqxbdrwxqc.supabase.co';
const supabaseKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bmplZm55anVrcXhiZHJ3eHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNDQwNDEsImV4cCI6MjEwNTcyMDA0MX0.Vgqn6aG5GKSqYZwSKbf7x9fn2BJhAx3zHn4OctrMnSM';
const supabaseclient = createClient(supabaseURL, supabaseKEY)


let students = JSON.parse(localStorage.getItem("students")) || [];

let editIndex = null;

const studentForm = document.getElementById("studentForm");
const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const studentCourse = document.getElementById("studentCourse");
const studentList = document.getElementById("studentList");
const submitBtn = document.getElementById("submitBtn");


// FORM SUBMIT

studentForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = studentName.value.trim();
    const email = studentEmail.value.trim();
    const course = studentCourse.value;

    if (!name || !email || !course) {
        return;
    }

    const student = {
        name: name,
        email: email,
        course: course
    };

   if (editIndex === null) {

    const savedStudent = await saveStudents(student);

    if (!savedStudent) {
        return;
    }

    students.push(savedStudent);

} else {

    const student_id = students[editIndex].id;
    const {data , error} = await supabaseclient
      .from("student_management")
      .update({
        name :name ,
        email : email , 
        course : course
      })
       .eq("id", student_id)
       .select();

if(error){
    console.log("there is an error in edit" , error)
     return;
}
 if (!data || data.length === 0){
console.log("No database row updated. Student ID:", student_id);
return;
 }
students[editIndex] = data[0];
    students[editIndex] = {
        ...students[editIndex],
        ...student
    };

    editIndex = null;
    submitBtn.textContent = "Add Student";


}

displayStudents();
studentForm.reset();

});
// SAVE DATA IN LOCAL STORAGE
let students1 = [];
async function saveStudents(student) {

    const { data, error } = await supabaseclient
        .from("student_management")
        .insert({
            name: student.name,
            email: student.email,
            course: student.course,
            is_completed: false
        })
        .select();

    if (error) {
        console.log("Insert error:", error);
        return null;
    }

    console.log("Student added:", data[0]);

    return data[0];
}




// DISPLAY STUDENTS
function displayStudents() {

    studentList.innerHTML = "";

    if (students.length === 0) {

        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "No students registered yet.";

        studentList.appendChild(message);
        return;
    }

    students.forEach(function (student, index) {

        const card = document.createElement("div");
        card.className = "student-card";

        const nameHeading = document.createElement("h3");
        nameHeading.textContent = student.name;

        const emailPara = document.createElement("p");
        emailPara.textContent = "Email: " + student.email;

        const coursePara = document.createElement("p");
        coursePara.textContent = "Course: " + student.course;

        const actions = document.createElement("div");
        actions.className = "student-actions";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";

        editBtn.addEventListener("click", function () {
            editStudent(index);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", function () {
            deleteStudent(student.id);
        });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        card.appendChild(nameHeading);
        card.appendChild(emailPara);
        card.appendChild(coursePara);
        card.appendChild(actions);

        studentList.appendChild(card);

    });

}


// EDIT STUDENT
 function editStudent(index) {

    studentName.value = students[index].name;
    studentEmail.value = students[index].email;
    studentCourse.value = students[index].course;

    editIndex = index;

    submitBtn.textContent = "Update Student";

    studentName.focus();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// DELETE STUDENT
async function deleteStudent(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    const { error } = await supabaseclient
        .from("student_management")
        .delete()
        .eq("id", id);

    if (error) {
        console.log("Delete error:", error.message);
        return;
    }

    students = students.filter(function(student) {
        return student.id !== id;
    });

    displayStudents();

    editIndex = null;
    submitBtn.textContent = "Add Student";

    console.log("Student deleted");
}

 async function fetchs(){
    const { data, error } = await supabaseclient
  .from('student_management')
  .select('*')
  .order("id" , {ascending : true});
  if (error){
    console.error("Fetch error:", error);
     return;
  }
  students = data; 
  displayStudents();
 }
 fetchs()