fetch("../../data.json")
  .then((response) => {
    if (!response.ok) {
      console.log("response: ", response.json());
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    console.log("data: ", data);
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const colorMap = {
      red: "#ff7f7f",
      green: "#99d699",
      blue: "#99ccff",
      purple: "#d8b9ff",
      pink: "#ffb3d9",
      gold: "#ffff99",
      grey: "#cccccc",
      white: "#ffffff",
    };
    function generateChartData(colorData) {
      // Calculate the starting weekday index (0-6 of the first date in the given
      // array)
      const firstWeekday = new Date(colorData[0].date).getDay(),
        monthLength = colorData.length,
        lastElement = colorData[monthLength - 1].date,
        lastWeekday = new Date(lastElement).getDay(),
        lengthOfWeek = 6,
        emptyTilesFirst = firstWeekday,
        chartData = [];

      // Add the empty tiles before the first day of the month with null values to
      // take up space in the chart
      for (let emptyDay = 0; emptyDay < emptyTilesFirst; emptyDay++) {
        chartData.push({
          x: emptyDay,
          y: 5,
          value: null,
          date: null,
          img_src: null,
          custom: {
            empty: true,
          },
        });
      }

      // Loop through and populate with temperature and dates from the dataset
      for (let day = 1; day <= monthLength; day++) {
        // Get date from the given data array
        const date = data[day - 1].date;
        // Offset by thenumber of empty tiles
        const xCoordinate = (emptyTilesFirst + day - 1) % 7;
        const yCoordinate = Math.floor((firstWeekday + day - 1) / 7);
        const id = day;
        const img_src = data[day - 1].img_src
          ? "../../saved_svg.svg"
          : "../../saved_svg.svg"; // find out how to add saved svg

        // Get the corresponding temperature for the current day from the given
        // array
        const temperature = data[day - 1].temperature;
        const color = colorMap[colorData[day - 1].color]; // Include color information

        chartData.push({
          x: xCoordinate,
          y: 5 - yCoordinate,
          value: temperature,
          date: new Date(date).getTime(),
          img_src: img_src,
          color: color,
          custom: {
            monthDay: id,
          },
        });
      }

      // Fill in the missing values when dataset is looped through.
      const emptyTilesLast = lengthOfWeek - lastWeekday;
      for (let emptyDay = 1; emptyDay <= emptyTilesLast; emptyDay++) {
        chartData.push({
          x: (lastWeekday + emptyDay) % 7,
          y: 0,
          value: null,
          date: null,
          img_src: null,
          custom: {
            empty: true,
          },
        });
      }
      return chartData;
    }
    const chartData = generateChartData(data);
    function drawCalendar(image) {
      Highcharts.chart("container", {
        chart: {
          type: "heatmap",
        },

        title: {
          text: "<div id='centeredPrivacy'>Color My Mood</div>",
          align: "left",
        },

        subtitle: {
          text: "<div id='centeredPrivacy'>Your Moods During March 2024",
          align: "left",
        },

        accessibility: {
          landmarkVerbosity: "one",
        },

        tooltip: {
          enabled: true,
          outside: true,
          zIndex: 20,
          headerFormat: "",
          pointFormat:
            "{#unless point.custom.empty}{point.date:%A, %b %e, %Y}{/unless}",
          nullFormat: "No data",
        },

        xAxis: {
          categories: weekdays,
          opposite: true,
          lineWidth: 26,
          offset: 13,
          lineColor: "rgba(27, 26, 37, 0.2)",
          labels: {
            rotation: 0,
            y: 20,
            style: {
              textTransform: "uppercase",
              fontWeight: "bold",
            },
            formatter: function () {
              return '<div id="calendarDays">' + this.value + "</div>";
            },
          },
          accessibility: {
            description: "weekdays",
            rangeDescription:
              "X Axis is showing all 7 days of the week, starting with Sunday.",
          },
        },

        yAxis: {
          min: 0,
          max: 5,
          accessibility: {
            description: "weeks",
          },
          visible: false,
        },

        legend: {
          align: "right",
          layout: "vertical",
          verticalAlign: "middle",
        },

        colorAxis: {
          min: 0,
          stops: [
            [0.2, "#ff7f7f"],
            [0.3, "#99d699"],
            [0.4, "#99ccff"],
            [0.5, "#d8b9ff"],
            [0.6, "#ffb3d9"],
            [0.7, "#ffff99"],
            [0.8, "#cccccc"],
          ],
          labels: {
            format: "{value} °C",
          },
        },

        series: [
          {
            keys: ["x", "y", "value", "date", "id"],
            data: chartData,
            nullColor: "rgba(196, 196, 196, 0.2)",
            dataLabels: [
              {
                enabled: true,
                useHTML: true,
                format:
                  '<img src={point.img_src} style="width: 20px; height: 20px;">',
                style: {
                  textOutline: "none",
                  fontWeight: "normal",
                  fontSize: "1rem",
                },
                y: 4,
              },
              {
                enabled: true,
                align: "left",
                verticalAlign: "top",
                format:
                  "{#unless point.custom.empty}{point.custom.monthDay}{/unless}",
                padding: 2,
                style: {
                  textOutline: "none",
                  color: "white",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  opacity: 1,
                },
                x: 1,
                y: 1,
              },
            ],
          },
        ],
      });
    }

    function submitDrawing(drawing) {
      var currentDate = new Date().toISOString().slice(0, 10);
      fetch("http://127.0.0.1:5000/submit_drawing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        // mode: "no-cors",
        body: JSON.stringify({ date: currentDate, drawing: drawing }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to submit drawing");
          }
          alert("Drawing submitted successfully");
          drawCalendar(
            "https://ej2.syncfusion.com/demos/src/schedule/images/newyear.svg"
          );
          location.reload();
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Failed to update drawing");
        });
    }
    drawCalendar(
      "https://ej2.syncfusion.com/demos/src/schedule/images/newyear.svg"
    );
    const editor = new jsdraw.Editor(document.body);
    editor.getRootElement().style.height = "50px";
    const toolbar = editor.addToolbar();
    toolbar.addSaveButton(async () => {
      const svgElem = editor.toSVG();
      console.log("The saved SVG: ", svgElem.outerHTML);
      submitDrawing(svgElem.outerHTML);
      drawCalendar(svgElem.outerHTML);
    });
  });
