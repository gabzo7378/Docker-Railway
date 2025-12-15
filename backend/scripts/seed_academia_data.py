"""
Script para poblar la base de datos con:
- 18 cursos con precios entre s/150 y s/200
- 20-25 docentes con datos aleatorios
- Ciclo Verano 2026 (5 enero - 5 marzo)
- Ofertas de cursos con horarios
- 4 paquetes de cursos (Grupos A, B, C, D)
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
import random
from datetime import time,date, timedelta
import bcrypt

load_dotenv()

# Conectar a la base de datos
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'academia_final'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'password'),
        port=os.getenv('DB_PORT', '5432')
    )

# Datos de cursos según especificación
COURSES = [
    {"name": "Aritmetica", "description": "Curso fundamental de aritmetica", "base_price": 180, "priority": "high"},
    {"name": "Algebra", "description": "Algebra basica y avanzada", "base_price": 190, "priority": "high"},
    {"name": "Geometria", "description": "Geometria plana y del espacio", "base_price": 170, "priority": "high"},
    {"name": "Trigonometria", "description": "Trigonometria y aplicaciones", "base_price": 175, "priority": "high"},
    {"name": "Fisica I", "description": "Mecanica y cinematica", "base_price": 200, "priority": "high"},
    {"name": "Fisica II", "description": "Electricidad y magnetismo", "base_price": 200, "priority": "high"},
    {"name": "Competencia Lingüística", "description": "Comprension y redaccion", "base_price": 160, "priority": "high"},
    {"name": "Quimica", "description": "Quimica general e inorganica", "base_price": 195, "priority": "high"},
    {"name": "Biologia", "description": "Biologia general y celular", "base_price": 185, "priority": "medium"},
    {"name": "Historia", "description": "Historia del Peru y universal", "base_price": 155, "priority": "medium"},
    {"name": "Filosofia y Logica", "description": "Pensamiento critico y logica", "base_price": 150, "priority": "medium"},
    {"name": "Educacion Civica", "description": "Civica y ciudadania", "base_price": 150, "priority": "medium"},
    {"name": "Razonamiento Matematico", "description": "Razonamiento logico-matematico", "base_price": 180, "priority": "high"},
    {"name": "Razonamiento Verbal", "description": "Comprension y analisis verbal", "base_price": 165, "priority": "high"},
    {"name": "Geografia", "description": "Geografia del Peru y mundial", "base_price": 155, "priority": "medium"},
    {"name": "Economia", "description": "Principios economicos basicos", "base_price": 160, "priority": "medium"},
]

# Paquetes de cursos según especificación
PACKAGES = [
    {
        "name": "Grupo A - Ingenieria y Ciencias Basicas",
        "description": "Paquete completo para ingenieria",
        "courses": ["Aritmetica", "Algebra", "Geometria", "Trigonometria", "Fisica I", "Fisica II", "Competencia Lingüística", "Quimica"],
        "discount": 0.15  # 15% descuento
    },
    {
        "name": "Grupo B - Ciencias de la Salud",
        "description": "Paquete para carreras de salud",
        "courses": ["Aritmetica", "Algebra", "Biologia", "Fisica I", "Fisica II", "Competencia Lingüística", "Quimica"],
        "discount": 0.15
    },
    {
        "name": "Grupo C - Ciencias Empresariales",
        "description": "Paquete para carreras empresariales",
        "courses": ["Aritmetica", "Algebra", "Historia", "Competencia Lingüística", "Geografia", "Economia", "Educacion Civica"],
        "discount": 0.15
    },
    {
        "name": "Grupo D - Ciencias Sociales",
        "description": "Paquete para ciencias sociales",
        "courses": ["Aritmetica", "Algebra", "Historia", "Competencia Lingüística", "Geografia", "Economia", "Educacion Civica"],
        "discount": 0.15
    }
]

# Nombres y apellidos para generar docentes aleatorios
FIRST_NAMES = ["Juan", "María", "Carlos", "Ana", "Luis", "Carmen", "José", "Rosa", "Pedro", "Elena",
               "Miguel", "Patricia", "Jorge", "Isabel", "Ricardo", "Laura", "Fernando", "Sofía", 
               "Roberto", "Gabriela", "Andrés", "Valentina", "Diego", "Lucía", "Rafael"]

LAST_NAMES = ["García", "Rodríguez", "Martínez", "Fernández", "López", "González", "Pérez", "Sánchez",
              "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Cruz", "Morales", "Reyes",
              "Gutiérrez", "Ortiz", "Mendoza", "Chávez", "Ruiz", "Vargas", "Castro", "Romero"]

SPECIALIZATIONS = [
    "Matemáticas", "Física", "Química", "Biología", "Historia", "Geografía",
    "Lenguaje y Literatura", "Filosofía", "Economía", "Educación Cívica"
]

# Horarios disponibles
WEEKDAY_SLOTS = [
    {"start": "07:00", "end": "09:00"},
    {"start": "09:00", "end": "11:00"},
    {"start": "11:00", "end": "13:00"},
    {"start": "14:00", "end": "16:00"},
    {"start": "16:00", "end": "18:00"},
    {"start": "18:00", "end": "20:00"},
]

SATURDAY_SLOTS = [
    {"start": "07:00", "end": "09:00"},
    {"start": "09:00", "end": "11:00"},
    {"start": "11:00", "end": "12:00"},
]

DAYS_WEEKDAY = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
DAYS_SATURDAY = ["Sábado"]

# Estructura para rastrear horarios ocupados
occupied_slots = {}

def is_slot_available(day, start_time, end_time):
    """Verifica si un horario está disponible"""
    key = f"{day}_{start_time}_{end_time}"
    return key not in occupied_slots

def occupy_slot(day, start_time, end_time):
    """Marca un horario como ocupado"""
    key = f"{day}_{start_time}_{end_time}"
    occupied_slots[key] = True

def generate_dni():
    """Genera un DNI aleatorio de 8 dígitos"""
    return str(random.randint(10000000, 99999999))

def generate_phone():
    """Genera un teléfono aleatorio"""
    return "9" + str(random.randint(10000000, 99999999))

def create_courses(conn):
    """Crea los 18 cursos en la base de datos"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    course_ids = {}
    
    print("\n=== Creando Cursos ===")
    for course in COURSES:
        cursor.execute("""
            INSERT INTO courses (name, description, base_price)
            VALUES (%s, %s, %s)
            RETURNING id
        """, (course["name"], course["description"], course["base_price"]))
        
        course_id = cursor.fetchone()['id']
        course_ids[course["name"]] = course_id
        print(f"✓ Creado: {course['name']} (ID: {course_id}, Precio: S/{course['base_price']})")
    
    conn.commit()
    cursor.close()
    return course_ids

def create_cycle(conn):
    """Crea el ciclo Verano 2026"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    print("\n=== Creando Ciclo ===")
    cursor.execute("""
        INSERT INTO cycles (name, start_date, end_date, duration_months, status)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
    """, ("Ciclo Verano 2026", date(2026, 1, 5), date(2026, 3, 5), 2, "open"))
    
    cycle_id = cursor.fetchone()['id']
    print(f"✓ Creado: Ciclo Verano 2026 (ID: {cycle_id})")
    print(f"  Fecha inicio: 05/01/2026")
    print(f"  Fecha fin: 05/03/2026")
    print(f"  Duración: 2 meses")
    
    conn.commit()
    cursor.close()
    return cycle_id

def create_teachers(conn, count=23):
    """Crea 20-25 docentes con datos aleatorios"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    teacher_ids = []
    
    print(f"\n=== Creando {count} Docentes ===")
    for i in range(count):
        first_name = random.choice(FIRST_NAMES)
        last_name = f"{random.choice(LAST_NAMES)} {random.choice(LAST_NAMES)}"
        dni = generate_dni()
        phone = generate_phone()
        email = f"{first_name.lower()}.{last_name.split()[0].lower()}@academia.edu.pe"
        specialization = random.choice(SPECIALIZATIONS)
        
        # Crear usuario para el docente
        password = bcrypt.hashpw(dni.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        try:
            cursor.execute("""
                INSERT INTO teachers (first_name, last_name, dni, phone, email, specialization)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (first_name, last_name, dni, phone, email, specialization))
            
            teacher_id = cursor.fetchone()['id']
            
            # Crear usuario asociado
            cursor.execute("""
                INSERT INTO users (username, password_hash, role, related_id)
                VALUES (%s, %s, %s, %s)
            """, (dni, password, 'teacher', teacher_id))
            
            teacher_ids.append(teacher_id)
            print(f"✓ Docente {i+1}: {first_name} {last_name} (DNI: {dni}, Especialidad: {specialization})")
        except Exception as e:
            print(f"✗ Error creando docente: {e}")
            conn.rollback()
            continue
    
    conn.commit()
    cursor.close()
    return teacher_ids

def assign_schedules_for_course(cursor, course_offering_id, course_name, priority):
    """Asigna horarios a una oferta de curso"""
    # Determinar número de sesiones según prioridad
    if priority == "high":
        sessions_per_week = 3  # Cursos importantes: 3 sesiones
    else:
        sessions_per_week = 2  # Otros cursos: 2 sesiones
    
    sessions_created = 0
    attempts = 0
    max_attempts = 50
    
    # Intentar crear las sesiones requeridas
    while sessions_created < sessions_per_week and attempts < max_attempts:
        attempts += 1
        
        # Elegir día aleatorio
        if random.random() < 0.9:  # 90% entre semana
            day = random.choice(DAYS_WEEKDAY)
            slot = random.choice(WEEKDAY_SLOTS)
        else:  # 10% sábado
            day = random.choice(DAYS_SATURDAY)
            slot = random.choice(SATURDAY_SLOTS)
        
        # Verificar disponibilidad
        if is_slot_available(day, slot["start"], slot["end"]):
            cursor.execute("""
                INSERT INTO schedules (course_offering_id, day_of_week, start_time, end_time, classroom)
                VALUES (%s, %s, %s, %s, %s)
            """, (course_offering_id, day, slot["start"], slot["end"], f"Aula {random.randint(101, 120)}"))
            
            occupy_slot(day, slot["start"], slot["end"])
            sessions_created += 1
            print(f"    • {day} {slot['start']}-{slot['end']}")
    
    return sessions_created

def create_course_offerings(conn, cycle_id, course_ids, teacher_ids):
    """Crea ofertas de cursos con sus horarios asignados"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    offering_ids = {}
    
    print("\n=== Creando Ofertas de Cursos y Horarios ===")
    
    # Reiniciar slots ocupados
    global occupied_slots
    occupied_slots = {}
    
    for course in COURSES:
        course_id = course_ids[course["name"]]
        teacher_id = random.choice(teacher_ids)
        group_label = f"Grupo {chr(65 + random.randint(0, 3))}"  # A, B, C, D
        
        cursor.execute("""
            INSERT INTO course_offerings (course_id, cycle_id, group_label, teacher_id, capacity)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (course_id, cycle_id, group_label, teacher_id, random.randint(20, 30)))
        
        offering_id = cursor.fetchone()['id']
        offering_ids[course["name"]] = offering_id
        
        print(f"\n  {course['name']} ({group_label}):")
        
        # Asignar horarios
        sessions = assign_schedules_for_course(cursor, offering_id, course["name"], course["priority"])
        print(f"    ✓ {sessions} sesiones asignadas")
    
    conn.commit()
    cursor.close()
    return offering_ids

def create_packages(conn, cycle_id, course_ids, offering_ids):
    """Crea los paquetes de cursos"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    print("\n=== Creando Paquetes de Cursos ===")
    
    for package in PACKAGES:
        # Calcular precio del paquete
        total_price = sum(
            next(c["base_price"] for c in COURSES if c["name"] == course_name)
            for course_name in package["courses"]
        )
        discounted_price = total_price * (1 - package["discount"])
        
        # Crear paquete
        cursor.execute("""
            INSERT INTO packages (name, description, base_price)
            VALUES (%s, %s, %s)
            RETURNING id
        """, (package["name"], package["description"], discounted_price))
        
        package_id = cursor.fetchone()['id']
        
        # Asociar cursos al paquete
        for course_name in package["courses"]:
            course_id = course_ids[course_name]
            cursor.execute("""
                INSERT INTO package_courses (package_id, course_id)
                VALUES (%s, %s)
            """, (package_id, course_id))
        
        # Crear oferta de paquete
        cursor.execute("""
            INSERT INTO package_offerings (package_id, cycle_id, capacity)
            VALUES (%s, %s, %s)
            RETURNING id
        """, (package_id, cycle_id, random.randint(15, 25)))
        
        package_offering_id = cursor.fetchone()['id']
        
        # Asociar ofertas de cursos al paquete ofertado
        for course_name in package["courses"]:
            if course_name in offering_ids:
                cursor.execute("""
                    INSERT INTO package_offering_courses (package_offering_id, course_offering_id)
                    VALUES (%s, %s)
                """, (package_offering_id, offering_ids[course_name]))
        
        print(f"✓ {package['name']}")
        print(f"  Cursos: {len(package['courses'])}")
        print(f"  Precio original: S/{total_price:.2f}")
        print(f"  Precio con descuento: S/{discounted_price:.2f} (ahorro {package['discount']*100}%)")
    
    conn.commit()
    cursor.close()

def main():
    print("="*60)
    print("SCRIPT DE POBLACIÓN DE BASE DE DATOS")
    print("Academia - Ciclo Verano 2026")
    print("="*60)
    
    try:
        conn = get_db_connection()
        print("✓ Conexión a base de datos establecida")
        
        # 1. Crear cursos
        course_ids = create_courses(conn)
        
        # 2. Crear ciclo
        cycle_id = create_cycle(conn)
        
        # 3. Crear docentes
        teacher_ids = create_teachers(conn, count=23)
        
        # 4. Crear ofertas de cursos con horarios
        offering_ids = create_course_offerings(conn, cycle_id, course_ids, teacher_ids)
        
        # 5. Crear paquetes
        create_packages(conn, cycle_id, course_ids, offering_ids)
        
        print("\n" + "="*60)
        print("✓ POBLACIÓN DE BASE DE DATOS COMPLETADA")
        print("="*60)
        print(f"Total cursos creados: {len(course_ids)}")
        print(f"Total docentes creados: {len(teacher_ids)}")
        print(f"Total ofertas de cursos: {len(offering_ids)}")
        print(f"Total paquetes creados: {len(PACKAGES)}")
        print("="*60)
        
        conn.close()
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
