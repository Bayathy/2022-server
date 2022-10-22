resource "google_sql_database_instance" "database" {
  name             = "main-instance"
  database_version = "POSTGRES_14"
  region           = "us-west1"
  root_password    = "root"

  settings {
    tier = "db-custom-1-3840"
    disk_size = 10
    disk_type = "PD_HDD"

    backup_configuration {
      enabled = true
      start_time = "15:00"
      point_in_time_recovery_enabled = true
    }
  }
  # テスト用
  deletion_protection = "false"
}


resource "google_cloud_run_service" "default" {
  name     = "server"
  location = "us-west1"

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "3"
        "autoscaling.knative.dev/minScale" = "1"
        # If true, garbage-collect CPU when once a request finishes
        # https://cloud.google.com/run/docs/configuring/cpu-allocation
        "run.googleapis.com/cpu-throttling" = false
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.database.connection_name
        "run.googleapis.com/client-name"        = "terraform"
      }
    }

    spec {
      containers {
        image = "us-west1-docker.pkg.dev/kosen-festa-server/my-repository/server-image"
        resources {
          limits = { "memory" : "0.5Gi", "cpu": "1" }
        }

        ports {
          container_port = "7000"
        }

        env {
          name  = "DB_NAME"
          value = google_sql_database.mydb.name
        }
        env {
          name  = "DB_USER"
          value = google_sql_user.users.name
        }
        env {
          name  = "DB_PASS"
          value = google_sql_user.users.password
        }

        env{
          name = "INSTANCE_UNIX_SOCKET" 
          value = "/cloudsql/kosen-festa-server:us-west1:main-instance"
        }

        env{
          name = "INSTANCE_CONNECTION_NAME"
          value = "kosen-festa-server:us-west1:main-instance"
        }
        env{
          name = "DATABASE_URL"
          value = "postgresql://user:password@localhost:5432/postgres?host=/cloudsql/kosen-festa-server:us-west1:main-instance&schema=public"
        }
      }
    }
  }
  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_artifact_registry_repository" "my-repo" {
  location      = "us-west1"
  repository_id = "my-repository"
  description   = "server docker repository"
  format        = "DOCKER"
}

resource "google_sql_database" "mydb" {
  name     = "mydb"
  instance = google_sql_database_instance.database.name
}

resource "google_sql_user" "users" {
  name     = "user"
  password = "password"
  instance = google_sql_database_instance.database.name
}

resource "google_cloudbuild_worker_pool" "pool" {
  name = "my-pool"
  location = "us-west1"
  worker_config {
    disk_size_gb = 100
    machine_type = "e2-standard-2"
  }
}

resource "google_cloudbuild_trigger" "include-build-logs-trigger" {
  location = "us-west1"
  name     = "container-builder"
  filename = "cloudbuild.yaml"

  github {
    owner = "suzuka-kosen-festa"
    name  = "2022-server"
    push {
      branch = "^main$"
    }
  }

  include_build_logs = "INCLUDE_BUILD_LOGS_WITH_STATUS"
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}
 
resource "google_cloud_run_service_iam_policy" "noauth" {
  location = google_cloud_run_service.default.location
  project  = google_cloud_run_service.default.project
  service  = google_cloud_run_service.default.name
 
  policy_data = data.google_iam_policy.noauth.policy_data
}