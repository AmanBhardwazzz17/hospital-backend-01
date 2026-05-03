// Register Function
async function registerUser() {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  });

  const data = await response.json();
  console.log(data);
  alert(data.message);
}

// Login Function
async function loginUser() {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  });

  const data = await response.json();
  console.log(data);
  
  if(data.token) {
    localStorage.setItem('token', data.token); // token save karo
    alert('Login Successful!');
  }
}